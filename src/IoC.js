import { generateUUID } from './scUtils';
import { Component } from './Component';

let classes = {};
let instances = {};

export class IoC {
  static provide(...providers) {
    for (let i = 0, provider; provider = providers[i]; i++) {
      if (!provider.uuid) {
        if (provider.prototype instanceof Component) {
          let component = new provider();
          provider.uuid = component.uuid;
          instances[component.uuid] = component;
        } else {
          let uuid = generateUUID();
          provider.uuid = uuid;
          classes[uuid] = provider;
        }
      }
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
