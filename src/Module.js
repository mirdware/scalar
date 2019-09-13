import { generateUUID } from './util/stdlib';
import Wrapper from './util/Wrapper';
import Component from './observable/Component';

const privy = new Wrapper();

export default class Module {
  constructor(...providers) {
    const properties = { classes: {}, instances: {} };
    privy.set(this, properties);
    providers.forEach((provider) => {
      if (!provider.uuid) {
        properties.classes[generateUUID(provider)] = provider;
      }
    });
  }

  inject(component) {
    const { classes, instances } = privy.get(this);
    const { uuid } = component;
    if (classes[uuid]) {
      const component = new classes[uuid]();
      component.uuid = uuid;
      instances[uuid] = component;
      delete classes[uuid];
    }
    return instances[uuid];
  }

  compose(selector, events) {
    const $nodes = document.querySelectorAll(selector);
    for (let i = 0, $node; $node = $nodes[i]; i++) {
      new Component($node, events, this);
    }
    return this;
  }
}
