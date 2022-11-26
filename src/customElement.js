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
const TYPES = [
  {E: HTMLElement},
  {E: HTMLParagraphElement, t: 'p'},
  {E: HTMLUListElement, t: 'ul'},
  {E: HTMLButtonElement, t: 'button'}
];

export default function customElement(options) {
  const type = options.extends;
  const fetch = type ? TYPES.find((type) => type.t === type) : TYPES[0];
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
    const methods = {
      connectedCallback: function (_this) {
        if (!Privy.get(_this).i) _this.onInit();
      },
      attributeChangedCallback: function (_this, name, oldValue, newValue) {
        if (!Privy.get(_this).i) _this.onInit();
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
        props.$.appendChild(createFragment('<style>' + options.styles + '</style>' + options.template));
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
