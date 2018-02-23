import { generateUUID } from './scUtils';

let correlation = {};

export class Wrapper {
  set(obj, props) {
    if (!obj.uuid) {
      Object.defineProperty(obj, 'uuid', { value: generateUUID() });
    }
    correlation[obj.uuid] = props;
  }

  get(obj) {
    let properties = {};
    let uuid = obj.uuid;
    if (uuid) {
      properties = correlation[uuid];
    }
    return properties;
  }
}
