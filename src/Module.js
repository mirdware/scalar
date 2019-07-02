import { generateUUID } from './util/stdlib';
import Component from './observable/Component';

function provide(provider, classes) {
  if (!provider.uuid) {
    const uuid = generateUUID();
    provider.uuid = uuid;
    classes[uuid] = provider;
  }
}

export default class Module {
  constructor(...providers) {
    this.classes = {};
    this.instances = {};
    providers.forEach((provider) => provide(provider, this.classes));
  }

  inject(component) {
    const uuid = component.uuid;
    if (this.classes[uuid]) {
      const component = new this.classes[uuid]();
      component.uuid = uuid;
      this.instances[uuid] = component;
      delete this.classes[uuid];
    }
    return this.instances[uuid];
  }

  compose(selector, events) {
    const $nodes = document.querySelectorAll(selector);
    for (let i = 0, $node; $node = $nodes[i]; i++) {
      new Component($node, events, this);
    }
    return this;
  }
}
