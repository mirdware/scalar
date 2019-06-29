import { generateUUID } from './util/Helper';
import Component from './Component';

const classes = {};
const instances = {};

function instance(provider) {
  if (provider.prototype instanceof Component) {
    const component = new provider();
    provider.uuid = component.uuid;
    return instances[component.uuid] = component;
  }
  const uuid = generateUUID();
  provider.uuid = uuid;
  classes[uuid] = provider;
}

export default class Module {
  constructor(...providers) {
    for (let i = 0, provider; provider = providers[i]; i++) {
      if (!provider.uuid) instance(provider);
    }
  }

  inject(component) {
    const uuid = component.uuid;
    if (classes[uuid] && !instances[uuid]) {
      const component = new classes[uuid]();
      component.uuid = uuid;
      instances[uuid] = component;
    }
    return instances[uuid];
  }

  compose(selector, events) {
    const nodes = document.querySelectorAll(selector);
    for (let i = 0, node; node = nodes[i]; i++) {
      new Component(node, events, this);
    }
    return this;
  }
}
