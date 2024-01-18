import Component, { watch } from "./observable/Component";
import { createFragment } from './view/Template';
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
  const fetch = TYPES[type] ? { t: type, E: TYPES[type] } : { E: HTMLElement };
  let component = fetch.C;
  if (!component) {
    component = class extends fetch.E {
      constructor() {
        super();
        this.attachShadow({mode: 'open'});
      }
    }
    const componentMethods = ["inject", "getIndex", "compose"];
    for (let i = 0, method; method = componentMethods[i]; i++) {
      component.prototype[method] = Component.prototype[method];
    }
    fetch.C = component;
  }
  return function decorator(Class) {
    if (type) Class.t = type;
    let prototype = Class;
    while (prototype.__proto__ !== Component) {
      prototype = prototype.__proto__;
    }
    Object.setPrototypeOf(prototype, component);
    Object.setPrototypeOf(prototype.prototype, component.prototype);
    Object.defineProperty(Class, 'observedAttributes', {
      get: function () {
        const str = this.toString();
        const _this = /(\w+)\s*=.+this[^\.]/.exec(str);
        const properties = str.match(new RegExp('(?<=' + (_this ? _this[1] : 'this') + '\\.)[^_\\$](\\w+(?=\\s*=))', 'g')) || [];
        return properties.map((property) => property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
      }
    });
    const methods = {
      connectedCallback: function (_this) {
        if (!Privy.get(_this).i) _this.onInit();
      },
      attributeChangedCallback: function (_this, name, oldValue, newValue) {
        if (!Privy.get(_this).i) _this.onInit();
        name = name.replace(/-./g, (x) => x[1].toUpperCase());
        if (typeof _this[name] === 'boolean') {
          newValue = true;
        } else if (_this[name] instanceof Object) {
          newValue = JSON.parse(newValue);
        }
        _this[name] = newValue;
      },
      onInit: function (_this) {
        const props = {
          $: _this.shadowRoot,
          m: Privy.get(Class.m),
          p_: {},
          e_: _this.listen ? _this.listen() : {},
          i: true
        };
        props.$.appendChild(createFragment('<style>' + (options.styles || '') + '</style>' + (options.template || '')));
        Privy.set(_this, props);
        watch(_this, props, props.$);
      }
    };
    for (const method in methods) {
      const userMethod = Class.prototype[method];
      Class.prototype[method] = function (...args) {
        methods[method](this, ...args);
        userMethod && userMethod.bind(this)(...args);
      }
    }
    return Class;
  }
}
