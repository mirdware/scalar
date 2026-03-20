import Component, { watch } from "./observable/Component";
import { createFragment } from './view/Template';
import { updateNodes } from './view/DOM';
import * as Privy from "./util/Wrapper"
/**
 *
 * @var {E} Element Elemento HTML del que hereda el componente
 * @var {t} type Tipo de elemento a heredar (p, ul, button)
 * @var {C} Component Clase cruzada entre el elemento y Component para heredar
 * @var {m} module Referencia al módulo que esta componiendo la clase
 * @var {i} initialized Flag que indica si el web component ha sido inicializado
 */
const TYPES = {
  p: HTMLParagraphElement,
  ul: HTMLUListElement,
  button: HTMLButtonElement,
  select: HTMLSelectElement,
  image: HTMLImageElement
};

export default function customElement(options) {
  const type = options.type;
  const element = TYPES[type] ? TYPES[type] : HTMLElement;
  let component = element.C;
  if (!component) {
    component = class extends element {
      constructor() {
        super();
        this.attachShadow({mode: 'open'});
      }
    }
    const componentMethods = ["inject", "getIndex", "compose"];
    for (let i = 0, method; method = componentMethods[i]; i++) {
      component.prototype[method] = Component.prototype[method];
    }
    element.C = component;
  }
  return function (Class) {
    Object.assign(Class, options);
    let prototype = Class;
    const properties = Object.keys(new Class()).filter(p => !p.startsWith('_') && !p.startsWith('$'));
    while (prototype.__proto__ !== Component) {
      prototype = prototype.__proto__;
    }
    Object.setPrototypeOf(prototype, component);
    Object.setPrototypeOf(prototype.prototype, component.prototype);
    Object.defineProperty(Class, 'observedAttributes', {
      get: function () {
        return properties.map((property) => property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
      }
    });
    const methods = {
      connectedCallback: function (_this) {
        if (!Privy.get(_this).i) _this.onInit();
      },
      attributeChangedCallback: function (_this, args) {
        let name = args[0];
        let newValue = args[2];
        if (!Privy.get(_this).i) _this.onInit();
        name = name.replace(/-./g, (x) => x[1].toUpperCase());
        if (typeof _this[name] === 'boolean') {
          newValue = (newValue !== null && newValue !== 'false');
        } else if (_this[name] instanceof Object) {
          newValue = JSON.parse(newValue);
        }
        _this[name] = newValue;
        return args;
      },
      onInit: function (_this) {
        const props = Privy.get(_this);
        const { template, styles, m } = _this.constructor;
        if (!props.$) {
          Object.assign(props, {
            m,
            $: _this.shadowRoot,
            p_: {},
            e_: _this.listen ? _this.listen() : {},
            i: true
          });
        }
        const $fragment = createFragment('<style>' + (styles || '') + '</style>' + (template || ''));
        updateNodes({ pc: props }, props.$, $fragment);
        watch(_this, props, props.$);
        if (m) {
          const tokens = Class._providers || [];
          return tokens.map(token => m.inject(token));
        }
      }
    };
    for (const method in methods) {
      const userMethod = Class.prototype[method];
      Class.prototype[method] = function (...args) {
        args = methods[method](this, args);
        userMethod && userMethod.bind(this)(...(args || []));
      }
    }
    return Class;
  }
}
