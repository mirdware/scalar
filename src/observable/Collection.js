import Wrapper from '../util/Wrapper';

const privy = new Wrapper();

export default class Collection {
  constructor(property, array) {
    privy.set(this, {property: property});
    this.array = array;
  }

  push = (element) => {
    const res = this.array.push(element);
    privy.get(this).property.set(this.array);
    return res;
  };

  pop = () => {
    const res = this.array.pop();
    privy.get(this).property.set(this.array);
    return res;
  };

  unshift = (element) => {
    const res = this.array.unshift(element);
    privy.get(this).property.set(this.array);
    return res;
  };

  shift = () => {
    const res = this.array.shift();
    privy.get(this).property.set(this.array);
    return res;
  };

  splice = (index, length) => {
    const res = this.array.splice(index, length);
    privy.get(this).property.set(this.array);
    return res;
  };

  map = (fn, index) => this.array.map(fn, index);

  forEach = (fn, index) => {
    this.array.forEach(fn, index);
    privy.get(this).property.set(this.array);
  };
}
