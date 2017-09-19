import { Component } from './Component';

let collection = {};

export function provide(...components) {
  components.forEach((component) => {
    let name = component.name;
    if (collection[name]) {
      throw 'Class ' + name + ' previously provided';
    }
    collection[name] = new component();
  });
}

export function inject(component) {
  let name = component.name;
  if (collection[name]) {
    return collection[name];
  }
}