import { compose } from './observable/Component';
import { clearEventListeners } from './util/Event';
import * as Privy from './util/Wrapper';
/**
 *
 * @var {module.c_} components Componentes generados por el módulo
 * @var {module.C} classes Clases provistas para el contenedor de dependencias
 * @var {module.i_} instances Objetos creados por el contenedor de dependencias
 * @var {module.m_} modules Loaders para cargar modulos dinamicos
 */
export const __components__ = new WeakMap();
const pendingRemoval = new Set();
const resolving = new Set();

function mutateComponents(mutations, callback) {
  for (const node of mutations) {
    if (node.nodeType === 1) {
      callback(node);
      node.querySelectorAll('[data-component],[data-webcomponent]').forEach(($node) => {
        callback($node);
      });
    }
  }
}

function removeComponent($node, shouldDeleteWebComponent) {
  const { shadowRoot } = $node
  if (!__components__.has($node) || (!shouldDeleteWebComponent && shadowRoot)) return;
  __components__.delete($node);
  delete $node.dataset.component;
  if (shadowRoot) {
    delete Privy.get($node).h;
    $node = shadowRoot;
  }
  $node.dispatchEvent(new Event('unmount', { bubbles: true, composed: true }));
  clearEventListeners($node);
}

export default class Module {
  constructor() {
    const properties = {C: new Map(), i_: new Map(), c_: [], m_: {},
      inject: (provider) => {
        const instances = properties.i_;
        if (properties.C.has(provider)) {
          provider = properties.C.get(provider);
        }
        if (process.env.NODE_ENV !== 'production') {
          if (!provider || resolving.has(provider)) {
            const chain = [...resolving].map(p => p.name).join(' → ');
            if (provider) {
              throw new Error(`Circular dependency detected while resolving: ${chain} → ${provider.name}`);
            }
            throw new Error(`A provider is undefined while resolving: ${chain} → undefined. This is likely caused by a circular import between modules`);
          }
          resolving.add(provider);
        }
        if (!instances.has(provider)) {
          const tokens = provider._providers || [];
          const dependencies = tokens.map(token => properties.inject(token));
          instances.set(provider, new provider(...dependencies));
        };
        if (process.env.NODE_ENV !== 'production') {
          resolving.delete(provider);
        }
        return instances.get(provider);
      }
    };
    Privy.set(this, properties);
  }

  compose(selector, behavioral) {
    Privy.get(this).c_.push({ s: selector, b: behavioral });
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
      document.querySelectorAll(wrapper.s).forEach(($node) => removeComponent($node));
    });
    properties.i_.clear();
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
    for (const { s: selector, b: behavioral } of module.c_) {
      if (/^[a-z]+-/.test(selector)) {
        const options = {};
        if (behavioral.type) {
          options["extends"] = behavioral.type;
        }
        if (!customElements.get(selector)) {
          behavioral.m = module;
          customElements.define(selector, behavioral, options);
        }
      } else {
        document.querySelectorAll(selector).forEach(($node) => {
          if (__components__.has($node)) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(`Selector "${selector}" already composed on`, $node);
            }
            return;
          }
          const component = compose($node, behavioral, module);
          $node.dataset.component = selector;
          __components__.set($node, { c: component, b: behavioral, s: selector });
        });
      }
    }
  }
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutateComponents(mutation.removedNodes, ($node) => pendingRemoval.add($node));
    mutateComponents(mutation.addedNodes, ($node) => pendingRemoval.delete($node));
  }
  Promise.resolve().then(() => {
    pendingRemoval.forEach(removeComponent);
    pendingRemoval.clear();
  });
});

observer.observe(document.body, { childList: true, subtree: true });

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
            document.querySelectorAll(element.s).forEach(component => {
              const privy = Privy.get(Privy.get(component).h);
              const props = privy.p_;
              privy.$.dispatchEvent(new Event('unmount', { bubbles: true, composed: true }));
              clearEventListeners(privy.$);
              component.reload(_new);
              const host = Privy.get(component).h;
              setProperties(host, props);
            });
          } else {
            document.querySelectorAll(element.s).forEach($component => {
              const oldComponent = __components__.get($component).c;
              const props = Privy.get(oldComponent).p_;
              $component.dispatchEvent(new Event('unmount', { bubbles: true, composed: true }));
              clearEventListeners($component);
              const component = compose($component, _new, module);
              __components__.set($component, { c: component, b: _new, s: element.s });
              setProperties(component, props);
            });
          }
          element.b = _new;
          console.log(`[HMR] updated component ${element.s}`);
        }
      });
      _new.moduleList = _old.moduleList
    }
  });

  window.addEventListener('keydown', function (e) {
    if (e.altKey && e.code === 'KeyS') debug.enable();
    if (e.altKey && e.code === 'KeyX') debug.disable();
  });

  window.queryComponent = ($node) => {
    let $element = $node.closest('[data-component]');
    if (!$element) {
      const root = $node.getRootNode();
      if (root instanceof ShadowRoot) {
        $element = root.host;
      }
    }
    return __components__.get($element);
  };

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
      [data-component] [data-component]:hover::after {
        z-index: 2;
        position: absolute;
        right: 0;
      }
      [data-bind] {
        outline: 1px solid #f58731;
        outline-offset: -1px;
      }
      [data-bind]::before, [data-action]::after {
        font-size: 10px;
        color: #fff;
        position: absolute;
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

  function setProperties(target, properties) {
    for (const name in properties) {
      const property = properties[name];
      if (!property.f) {
        target[name] = property.v;
      }
    }
  }
}
