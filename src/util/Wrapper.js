import { generateUUID } from './stdlib';

const correlation = {};

export default class Wrapper {
  set(obj, props) {
    if (!obj.uuid) {
      Object.defineProperty(obj, 'uuid', {value: generateUUID()});
    }
    correlation[obj.uuid] = props;
  }

  get(obj) {
    const uuid = obj.uuid;
    if (uuid) {
      return correlation[uuid];
    }
    return {};
  }
}
