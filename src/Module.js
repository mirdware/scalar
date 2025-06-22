import { generateUUID } from './util/Element';
import { compose } from './observable/Component';
import * as Privy from './util/Wrapper';
/**
 *
 * @var {module.c_} components Componentes generados por el módulo
 * @var {module.C} classes Clases provistas para el contenedor de dependencias
 * @var {module.i_} instances Objetos creados por el contenedor de dependencias
 */
export default class Module {
  constructor() {
    this.c_ = [];
    const properties = {C: {}, i_: {}, c_: {},
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
    this.c_.push([selector, behavioral]);
    return this;
  }

  bind(origin, replace) {
    Privy.get(this).C[origin.uuid] = replace;
    return this;
  }

  add(module) {
    const src = Privy.get(module);
    const dst = Privy.get(this);
    Object.assign(dst.C, src.C);
    Object.assign(dst.i_, src.i_);
    return this;
  }

  execute() {
    const module = Privy.get(this);
    let element;
    while (element = this.c_.shift()) {
      if (/^[a-z]+-/.test(element[0])) {
        element[1].m = this;
        if (element[1].t) {
          element.push({ extends: element[1].t });
        }
        if (!customElements.get(element[0])) {
          customElements.define(...element);
        }
      } else {
        const $nodes = document.querySelectorAll(element[0]);
        for (let i = 0, $node; $node = $nodes[i]; i++) {
          const component = compose($node, element[1], module);
          module.c_[component.uuid] = component;
          $node.dataset.component = component.uuid;
        }
      }
    }
  }
}
