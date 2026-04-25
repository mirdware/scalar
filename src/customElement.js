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
function onInit(_this, UserClass, NewClass) {
  const host = new UserClass(...Privy.get(UserClass).d_);
  const props = Privy.get(host);
  host.shadowRoot = _this.shadowRoot;
  Object.assign(props, {
    m: NewClass.m,
    $: host.shadowRoot,
    p_: {},
    e_: host.listen ? host.listen() : {}
  });
  const $fragment = createFragment('<style>' + (NewClass.styles || '') + '</style>' + (NewClass.template || ''));
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
        if (!privy.h) {
          onInit(this, UserClass, NewClass);
        }
        if (privy.h.connectedCallback) {
          privy.h.connectedCallback();
        }
      }

      attributeChangedCallback(...args) {
        const privy = Privy.get(this);
        let name = args[0];
        let newValue = args[2];
        if (!privy.h) onInit(this, UserClass, NewClass);
        const host = privy.h;
        name = name.replace(/-./g, (x) => x[1].toUpperCase());
        if (typeof host[name] === 'boolean') {
          newValue = (newValue !== null && newValue !== 'false');
        } else if (host[name] instanceof Object) {
          newValue = JSON.parse(newValue);
        }
        host[name] = newValue;
        if (privy.h.attributeChangedCallback) {
          privy.h.attributeChangedCallback(...args);
        }
      }
    }
    const { prototype } = NewClass;
    Object.getOwnPropertyNames(UserClass.prototype).forEach(key => {
      if (typeof UserClass.prototype[key] === 'function' && !prototype[key]) {
        prototype[key] = function (...args) {
          const privy = Privy.get(this);
          if (privy.h) {
            return privy.h[key](...args);
          }
          if (process.env.NODE_ENV !== 'production') {
             console.warn(`method "${key}" ignored. Component not inicialized.`);
          }
        }
      }
    });
    Object.defineProperty(NewClass, 'observedAttributes', {
      get: () => {
        const privy = Privy.get(UserClass);
        if (!privy.d_) {
          const tokens = UserClass._providers || [];
          privy.d_ = NewClass.m ? tokens.map(token => NewClass.m.inject(token)) : [];
        }
        if (!UserClass.observedAttributes) {
          UserClass.observedAttributes = Object.keys(new UserClass(...privy.d_))
            .filter(property => !property.startsWith('_') && !property.startsWith('$'))
            .map((property) => property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase());
        }
        return UserClass.observedAttributes;
      }
    });
    Object.assign(NewClass, options);
    if (process.env.NODE_ENV !== 'production') {
      NewClass._userClass = UserClass;
      prototype.reload = function (NewDecoratedClass) {
        const { m } = this.constructor;
        const TargetClass = NewDecoratedClass._userClass || NewDecoratedClass;
        const tokens = TargetClass._providers || [];
        Privy.get(TargetClass).d_ = m ? tokens.map(token => m.inject(token)) : [];
        NewDecoratedClass.m = m;
        onInit(this, TargetClass, NewDecoratedClass);
      };
    }
    return NewClass;
  }
}
