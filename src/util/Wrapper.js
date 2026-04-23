import { generateUUID } from './Element';
import { __components__ } from '../Module';

const correlation = new WeakMap();

export function set(object, properties) {
  let { uuid } = object;
  if (!uuid) {
    uuid = generateUUID(object);
  }
  correlation.set(object, properties);
  return uuid;
}

export function get(object) {
  if (!correlation.has(object)) {
    set(object, {});
  }
  return correlation.get(object);
}

export function remove(object) {
  const { uuid } = object;
  if (uuid) {
    __components__.delete(uuid);
  }
  correlation.delete(object);
}
