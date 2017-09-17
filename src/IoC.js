import { Component } from './Component';

let collection = {};

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function provide(...components) {
  components.forEach((component) => {
    component.uuid = generateUUID();
    collection[component.uuid] = new component();
  });
}

export function inject(component) {
  if (component.uuid && collection[component.uuid]) {
    return collection[component.uuid];
  }
}