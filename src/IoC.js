import { Component } from './Component';

let collection = {};

export class IoC {
  static provide(name, provider) {
    if (typeof name === 'object') {
      for (let prop in name) {
        IoC.provide(prop, name[prop]);
      }
      return IoC;
    }
    if (collection[name]) {
      throw 'Class for ' + name + ' previously provided';
    }
    collection[name] = new provider();
    return IoC;
  }

  static inject(name) {
    if (collection[name]) {
      return collection[name];
    }
  }
}
