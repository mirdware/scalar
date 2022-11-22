import { generateUUID } from './util/Element';
import { compose } from './observable/Component';
import * as Privy from './util/Wrapper';

export default class Module {
  constructor(...providers) {
    this.components = [];
    const properties = {
      classes: {},
      instances: {},
      components: {},
      inject: (provider) => {
        const { instances } = properties;
        const { uuid } = provider;
        if (!instances[uuid]) {
          instances[uuid] = new properties.classes[uuid](properties.inject);
          instances[uuid].uuid = uuid;
        };
        return instances[uuid];
      }
    };
    Privy.set(this, properties);
    providers.forEach((provider) => {
      if (!provider.uuid) {
        properties.classes[generateUUID(provider)] = provider;
      }
    });
  }

  compose(selector, behavioral) {
    this.components.push([selector, behavioral]);
    return this;
  }

  bind(origin, replace) {
    Privy.get(this).classes[origin.uuid] = replace;
    return this;
  }

  add(module) {
    const src = Privy.get(module);
    const dst = Privy.get(this);
    Object.assign(dst.classes, src.classes);
    Object.assign(dst.instances, src.instances);
    return this;
  }

  execute() {
    const module = Privy.get(this);
    let element;
    while (element = this.components.shift()) {
      if (/^[a-z]+-/.test(element[0])) {
        element[1].module = this;
        if (element[1].type) {
          element.push({ extends: element[1].type });
        }
        customElements.define(...element);
      } else {
        const $nodes = document.querySelectorAll(element[0]);
        for (let i = 0, $node; $node = $nodes[i]; i++) {
          const component = compose($node, element[1], module);
          module.components[component.uuid] = component;
          $node.dataset.component = component.uuid;
        }
      }
    }
  }
}
