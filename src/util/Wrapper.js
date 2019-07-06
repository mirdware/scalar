import { generateUUID } from './stdlib';

const correlation = {};

export default class Wrapper {
  set(obj, props) {
    let { uuid } = obj;
    if (!uuid) {
      uuid = generateUUID(obj);
    }
    correlation[uuid] = props;
    return uuid;
  }

  get(obj) {
    let { uuid } = obj;
    if (!uuid) {
      uuid = this.set(obj, {});
    }
    return correlation[uuid];
  }
}
