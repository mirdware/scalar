import { generateUUID } from './stdlib';

export default class Wrapper {
  constructor() {
    this.correlation = {};
  }

  set(obj, props) {
    let { uuid } = obj;
    if (!uuid) {
      uuid = generateUUID(obj);
    }
    this.correlation[uuid] = props;
    return uuid;
  }

  get(obj) {
    let { uuid } = obj;
    if (!uuid) {
      uuid = this.set(obj, {});
    }
    return this.correlation[uuid];
  }
}
