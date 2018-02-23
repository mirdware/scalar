import { generateUUID } from './scUtils';
import { Component } from './Component';

let classes = {};
let instances = {};

function instance(provider) {
  if (provider.prototype instanceof Component) {
    let component = new provider();
    provider.uuid = component.uuid;
    return instances[component.uuid] = component;
  }
  let uuid = generateUUID();
  provider.uuid = uuid;
  classes[uuid] = provider;
}

export class IoC {
  static provide(...providers) {
    for (let i = 0, provider; provider = providers[i]; i++) {
      if (!provider.uuid) instance(provider);
    }
  }

  static inject(component) {
    let uuid = component.uuid;
    if (classes[uuid] && !instances[uuid]) {
      let component = new classes[uuid]();
      component.uuid = uuid;
      instances[uuid] = component;
    }
    return instances[uuid];
  }
}
