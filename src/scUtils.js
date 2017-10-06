let correlation = {};

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
