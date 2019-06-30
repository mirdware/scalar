import { generateUUID } from './util/Helper';
import Component from './Component';

function provide(provider, classes) {
  if (!provider.uuid) {
    const uuid = generateUUID();
    provider.uuid = uuid;
    classes[uuid] = provider;
  }
}

function getHandler(observers) {
  return {
    set: (obj, prop, value) => {
      const execution = Reflect.set(obj, prop, value);
      observers.forEach((fn) => fn());
      return execution;
    },
    apply: (target, thisArg, argumentsList) => {
      const execution = Reflect.apply(target, thisArg, argumentsList);
      observers.forEach((fn) => fn());
      return execution;
    }
  }
}

export default class Module {
  constructor(...providers) {
    this.observers = [];
    this.classes = {};
    this.instances = {};
    providers.forEach((provider) => provide(provider, this.classes));
  }

  inject = (component) => {
    const uuid = component.uuid;
    if (this.classes[uuid] && !this.instances[uuid]) {
      const component = new this.classes[uuid]();
      component.uuid = uuid;
      this.instances[uuid] = new Proxy(component, getHandler(this.observers));
    }
    return this.instances[uuid];
  };

  compose = (selector, events) => {
    const nodes = document.querySelectorAll(selector);
    for (let i = 0, node; node = nodes[i]; i++) {
      new Component(node, events, this);
    }
    return this;
  };
}
