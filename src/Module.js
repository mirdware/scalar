import { generateUUID } from './util/stdlib';
import { compose } from './observable/Component';
import * as Privy from './util/Wrapper';

export default class Module {
  constructor(...providers) {
    const properties = {
      classes: {},
      instances: {},
      components: {},
      inject: (provider) => {
        const { classes, instances } = properties;
        const { uuid } = provider;
        if (classes[uuid]) {
          provider = new classes[uuid](properties.inject);
          provider.uuid = uuid;
          instances[uuid] = provider;
          delete classes[uuid];
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
    const $nodes = document.querySelectorAll(selector);
    for (let i = 0, $node; $node = $nodes[i]; i++) {
      const component = compose($node, behavioral, Privy.get(this));
      Privy.get(this).components[component.uuid] = component;
      $node.dataset.component = component.uuid;
    }
    return this;
  }
}
