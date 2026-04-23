import { watch } from "./observable/Component";
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
function onInit(_this, UserClass, options) {
  const { m } = _this.constructor;
  const tokens = UserClass._providers || [];
  const deps = m ? tokens.map(token => m.inject(token)) : [];
  const host = new UserClass(...deps);
  const props = Privy.get(host);
  host.shadowRoot = _this.shadowRoot;
  Object.assign(props, {
    m,
    $: host.shadowRoot,
    p_: {},
    e_: host.listen ? host.listen() : {}
  });
  const $fragment = createFragment('<style>' + (options.styles || '') + '</style>' + (options.template || ''));
  updateNodes({ pc: props }, props.$, $fragment);
  watch(host, props, props.$);
  props.$.dispatchEvent(new Event('mount', { bubbles: true, composed: true }));
  Privy.get(_this).h = host;
}

export default function customElement(options) {
  let Element = HTMLElement;
  if (options.type) {
    const { constructor } = document.createElement(options.type);
    if (constructor !== HTMLUnknownElement) {
      Element = constructor;
    }
  }
  return function (UserClass) {
    class NewClass extends Element {
      constructor() {
        super();
        this.attachShadow({mode: 'open'});
      }

      connectedCallback() {
        const privy = Privy.get(this);
        if (!privy.h) onInit(this, UserClass, options);
        if (privy.h.connectedCallback) {
          privy.h.connectedCallback();
        }
      }

      disconnectedCallback() {
        const host = Privy.get(this).h;
        if (host.disconnectedCallback) {
          host.disconnectedCallback();
        }
      }

      adoptedCallback() {
        const host = Privy.get(this).h;
        if (host.adoptedCallback) {
          host.adoptedCallback();
        }
      }

      attributeChangedCallback(...args) {
        const privy = Privy.get(this);
        let name = args[0];
        let newValue = args[2];
        if (!privy.h) onInit(this, UserClass, options);
        const host = privy.h;
        name = name.replace(/-./g, (x) => x[1].toUpperCase());
        if (typeof host[name] === 'boolean') {
          newValue = (newValue !== null && newValue !== 'false');
        } else if (host[name] instanceof Object) {
          newValue = JSON.parse(newValue);
        }
        host[name] = newValue;
        if (host.attributeChangedCallback) {
          host.attributeChangedCallback(...args);
        }
      }
    }
    const properties = Object.keys(new UserClass()).filter(p => !p.startsWith('_') && !p.startsWith('$'));
    Object.defineProperty(NewClass, 'observedAttributes', {
      get: function () {
        return properties.map((property) => property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
      }
    });
    Object.assign(NewClass, options);
    if (process.env.NODE_ENV !== 'production') {
      NewClass._userClass = UserClass;
      NewClass.prototype.reload = function (NewDecoratedClass) {
        const TargetClass = NewDecoratedClass._userClass || NewDecoratedClass;
        onInit(this, TargetClass, NewDecoratedClass);
      };
    }
    return NewClass;
  }
}
