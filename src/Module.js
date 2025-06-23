import { generateUUID } from './util/Element';
import { compose } from './observable/Component';
import * as Privy from './util/Wrapper';
/**
 *
 * @var {module.c_} components Componentes generados por el módulo
 * @var {module.C} classes Clases provistas para el contenedor de dependencias
 * @var {module.i_} instances Objetos creados por el contenedor de dependencias
 * @var {module.m_} modules Loaders para cargar modulos dinamicos
 */
export default class Module {
  constructor() {
    const properties = {C: {}, i_: {}, c_: [], m_: {},
      inject: (provider) => {
        const instances = properties.i_;
        const uuid = provider.uuid ?? generateUUID(provider);
        if (!instances[uuid]) {
          if (properties.C[uuid]) {
            provider = properties.C[uuid];
          }
          instances[uuid] = new provider(properties.inject);
          instances[uuid].uuid = uuid;
        };
        return instances[uuid];
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
    Privy.get(this).C[origin.uuid] = replace;
    return this;
  }

  add(url, loader, options) {
    Privy.get(this).m_[url] = [loader, options || {}];
    return this;
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
        behavioral.m = this;
        if (behavioral.t) {
          options["extends"] = behavioral.t;
        }
        if (!customElements.get(selector)) {
          customElements.define(selector, behavioral, options);
        }
      } else {
        const $nodes = document.querySelectorAll(selector);
        for (let i = 0, $node; $node = $nodes[i]; i++) {
          const component = compose($node, behavioral, module);
          components.push(component);
          $node.dataset.component = component.uuid;
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
            _new.m = _old.m;
            Object.getOwnPropertyNames(_new.prototype).forEach(key => {
              if (key !== 'constructor') {
                Object.defineProperty(_old.prototype, key, Object.getOwnPropertyDescriptor(_new.prototype, key));
              }
            });
          } else {
            element.c_.forEach((oldComponent, index) => {
              const $component = document.querySelector(`[data-component="${oldComponent.uuid}"]`);
              clearEventListeners($component);
              const component = compose($component, _new, module);
              element.c_.splice(index, 1);
              element.c_.push(component);
              $component.dataset.component = component.uuid;
              console.log(`[HMR] updated component ${oldComponent.uuid} to ${component.uuid}`);
              Privy.remove(oldComponent);
            });
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

  function clearEventListeners($component) {
    const $components = Array.from($component.querySelectorAll('*'));
    $components.unshift($component);
    $components.forEach($ => {
      if ($.eventListenerList) {
        $.eventListenerList.forEach(listener => {
          $.removeEventListener(listener.name, listener.fn, listener.opt);
        });
        delete $.eventListenerList;
      }
    });
  }
}
