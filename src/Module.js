import { compose } from './observable/Component';
import * as Privy from './util/Wrapper';

export const __components__ = new Map();

function clearEventListeners($node) {
  const elements = [$node, ...$node.querySelectorAll('*')];
  elements.forEach(el => {
    if (el.eventListenerList) {
      el.eventListenerList.forEach(item => {
        el.removeEventListener(item.name, item.fn, item.opt);
      });
      delete el.eventListenerList;
    }
  });
}

/**
 *
 * @var {module.c_} components Componentes generados por el módulo
 * @var {module.C} classes Clases provistas para el contenedor de dependencias
 * @var {module.i_} instances Objetos creados por el contenedor de dependencias
 * @var {module.m_} modules Loaders para cargar modulos dinamicos
 */
export default class Module {
  constructor() {
    const properties = {C: new WeakMap(), i_: new WeakMap(), c_: [], m_: {},
      inject: (provider) => {
        const instances = properties.i_;
        if (!instances.has(provider)) {
          if (properties.C.has(provider)) {
            provider = properties.C.get(provider);
          }
          const payload = {};
          instances.set(provider, payload);
          const tokens = provider._providers || [];
          const dependencies = tokens.map(token => properties.inject(token));
          const instance = new provider(...dependencies);
          Object.setPrototypeOf(payload, Object.getPrototypeOf(instance));
          Object.defineProperties(payload, Object.getOwnPropertyDescriptors(instance));
        };
        return instances.get(provider);
      }
    };
    Privy.set(this, properties);
  }

  compose(selector, behavioral) {
    Privy.get(this).c_.push({ s: selector, b: behavioral, c_: [] });
    if (process.env.NODE_ENV !== 'production') {
      if (!behavioral.moduleList) {
        behavioral.moduleList = [];
      }
      behavioral.moduleList.push(this);
    }
    return this;
  }

  bind(origin, replace) {
    Privy.get(this).C.set(origin, replace);
    return this;
  }

  /** @deprecated */
  add(url, loader, options) {
    Privy.get(this).m_[url] = [loader, options || {}];
    return this;
  }

  dispose() {
    const properties = Privy.get(this);
    properties.c_.forEach(wrapper => {
      wrapper.c_.forEach(component => {
        const compProps = Privy.get(component);
        if (compProps?.$) {
          clearEventListeners(compProps.$);
          delete compProps.$.dataset.component;
        }
        Privy.remove(component);
      });
    });
    properties.i_ = new WeakMap();
    properties.c_ = [];
  }

  execute() {
    const module = Privy.get(this);
    for (const url in module.m_) {
      const [loader, options] = module.m_[url];
      const { pathname } = location;
      if (options.middleware ? pathname.startsWith(url) : pathname === url) {
        loader().then((mod) => mod.default.execute());
      }
    }
    for (const { s: selector, b: behavioral, c_: components } of module.c_) {
      if (/^[a-z]+-/.test(selector)) {
        const options = {};
        if (behavioral.type) {
          options["extends"] = behavioral.type;
        }
        if (!customElements.get(selector)) {
          behavioral.m = module;
          customElements.define(selector, behavioral, options);
          if (process.env.NODE_ENV !== 'production') {
            document.querySelectorAll(selector).forEach((element) => {
              element.shadowRoot.adoptedStyleSheets = [debug.sheet];
              element.dataset.webcomponent = element.uuid;
              __components__.set(element.uuid, {c: element, b: behavioral, s: selector});
            });
          }
        }
      } else {
        const $nodes = document.querySelectorAll(selector);
        for (let i = 0, $node; $node = $nodes[i]; i++) {
          const component = compose($node, behavioral, module);
          components.push(component);
          $node.dataset.component = component.uuid;
          __components__.set(component.uuid, {c: component, b: behavioral, s: selector});
        }
      }
    }
  }
}

if (process.env.NODE_ENV !== 'production') {
  window.addEventListener('scalar-hmr-update', (e) => {
    const { _old, _new } = e.detail;
    if (_new instanceof Module) {
      _new.execute();
    } else if (_old.moduleList) {
      _old.moduleList.forEach(module => {
        module = Privy.get(module);
        const element = module.c_.find(element => element.b === _old);
        if (element) {
          if (/^[a-z]+-/.test(element.s)) {
            Object.getOwnPropertyNames(_new.prototype).forEach(key => {
              if (key !== 'constructor') {
                Object.defineProperty(_old.prototype, key, Object.getOwnPropertyDescriptor(_new.prototype, key));
              }
            });
            document.querySelectorAll(element.s).forEach(component => {
              const props = Privy.get(component);
              props.e_ = component.listen ? component.listen() : {};
              props.p_ = {};
              Object.assign(component.constructor, _new);
              component.onInit();
            });
          } else {
            for (let index = element.c_.length - 1, oldComponent; oldComponent = element.c_[index]; index--) {
              const $component = document.querySelector(`[data-component="${oldComponent.uuid}"]`);
              if (!$component) continue;
              clearEventListeners($component);
              const component = compose($component, _new, module);
              element.c_.splice(index, 1);
              element.c_.push(component);
              $component.dataset.component = component.uuid;
              console.log(`[HMR] updated component ${oldComponent.uuid} to ${component.uuid}`);
              Privy.remove(oldComponent);
            }
          }
          element.b = _new;
        }
      });
      _new.moduleList = _old.moduleList
    }
    if (_old.uuid) {
      if (_new.uuid) {
        Privy.remove(_old);
        console.log(`[HMR] updated module ${_old.uuid} to ${_new.uuid}`);
      } else{
        Object.defineProperty(_new, 'uuid', {
          value: _old.uuid,
          configurable: false,
          writable: false
        });
        console.log(`[HMR] provider ${_old.uuid} replaced`);
      }
    }
  });

  window.addEventListener('keydown', function (e) {
    if (e.altKey && e.code === 'KeyS') debug.enable();
    if (e.altKey && e.code === 'KeyX') debug.disable();
  });

  window.queryComponent = (target) => __components__.get(getComponentId(target));

  window.debug = {
    sheet: new CSSStyleSheet(),
    enable() {
      this.sheet.replaceSync(`
      [data-component]::after, [data-webcomponent]::after {
        position: absolute;
        display: block;
        background: rgba(0, 0, 0, .5);
        color: #fff;
        z-index: 1;
      }
      [data-component]:hover::after {
        content: attr(data-component);
      }
      [data-webcomponent]:hover::after {
        content: attr(data-webcomponent);
      }
      [data-webcomponent] {
        outline: 2px dashed #2196F3;
      }
      [data-component] {
        outline: 2px dashed #f58731;
      }
      [data-component] [data-component] {
        outline: 2px dashed #F00;
      }
      [data-bind] {
        outline: 1px solid #f58731;
        outline-offset: -1px;
      }
      [data-bind]::before, [data-action]::after {
        font-size: 10px;
        color: #fff;
        position: absolute;
        z-index: 2;
      }
      [data-bind]::before {
        content: "🔗";
        background: #f58731;
      }
      [data-bind]:hover::before {
        content: "🔗 " attr(data-bind);
      }
      [data-action]::after {
        content: "⚡";
        background: #2196F3;
      }
      [data-action]:hover::after {
        content: "⚡ " attr(data-action);
      }
      `);
      if (document.adoptedStyleSheets.indexOf(this.sheet) === -1) {
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, this.sheet];
      }
    },
    disable() {
      this.sheet.replaceSync('');
    }
  }

  function getComponentId(target) {
    if (target instanceof HTMLElement) {
      const $el = target.closest('[data-component]');
      if ($el) {
        return $el.dataset.component;
      }
      const root = target.getRootNode();
      if (root instanceof ShadowRoot) {
        return root.host.uuid;
      }
    }
    return target;
  }
}
