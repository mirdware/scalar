import Component, { watch } from "./observable/Component";
import * as Privy from "./util/Wrapper"

const COMPONENTS = [
  {
    element: HTMLElement
  },
  {
    type: "p",
    element: HTMLParagraphElement
  },
  {
    type: "ul",
    element: HTMLUListElement
  },
  {
    type: "button",
    element: HTMLButtonElement
  }
];

export default function customElement(options) {
  const type = options.extends;
  const componentFetch = type ? COMPONENTS.find((component) => component.type === type) : COMPONENTS[0];
  let { element, component } = componentFetch;
  if (!component) {
    component = class extends element {
      constructor() {
        super();
        this.attachShadow({
          mode: "open"
        });
      }
    }
    const componentMethods = ["inject", "getIndex", "compose"];
    for (let i = 0, method; method = componentMethods[i]; i++) {
      component.prototype[method] = Component.prototype[method];
    }
    componentFetch.component = component;
  }
  return function decorator(Class) {
    if (type) Class.type = type;
    let prototype = Class;
    while (prototype.__proto__ !== Component) {
      prototype = prototype.__proto__;
    }
    Object.setPrototypeOf(prototype, component);
    Object.setPrototypeOf(prototype.prototype, component.prototype);
    const methods = {
      connectedCallback: function (_this) {
        if (!Privy.get(_this).init) _this.onInit();
      },
      attributeChangedCallback: function (_this, name, oldValue, newValue) {
        if (!Privy.get(_this).init) _this.onInit();
        _this[name] = newValue;
      },
      onInit: function (_this) {
        _this.shadowRoot.innerHTML = '<style>' + options.styles + '</style>' + options.template;
        const props = {
          $node: _this.shadowRoot,
          module: Class.module,
          properties: {},
          events: _this.listen ? _this.listen() : {},
          init: true
        };
        Privy.set(_this, props);
        watch(_this, props, _this.shadowRoot);
      }
    };
    for (const method in methods) {
      const old = Class.prototype[method];
      Class.prototype[method] = function (...args) {
        methods[method](this, ...args);
        old && old(...args);
      }
    }
    return Class;
  }
}