import { generateUUID } from './util/stdlib';
import { compose } from './observable/Component';
import * as Privy from './util/Wrapper';

export default class Module {
  constructor(...providers) {
    const properties = { classes: {}, instances: {} };
    Privy.set(this, properties);
    providers.forEach((provider) => {
      if (!provider.uuid) {
        properties.classes[generateUUID(provider)] = provider;
      }
    });
  }

  inject(provider) {
    const { classes, instances } = Privy.get(this);
    const { uuid } = provider;
    if (classes[uuid]) {
      provider = new classes[uuid]();
      provider.uuid = uuid;
      instances[uuid] = provider;
      delete classes[uuid];
    }
    return instances[uuid];
  }

  compose(selector, behavioral) {
    const $nodes = document.querySelectorAll(selector);
    for (let i = 0, $node; $node = $nodes[i]; i++) {
      compose($node, behavioral, this);
    }
    return this;
  }
}
