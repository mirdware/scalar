import { generateUUID } from './stdlib';

const correlation = {};

export function set(object, properties) {
  let { uuid } = object;
  if (!uuid) {
    uuid = generateUUID(object);
  }
  correlation[uuid] = properties;
  return uuid;
}

export function get(object) {
  let { uuid } = object;
  if (!uuid) {
    uuid = set(object, {});
  }
  return correlation[uuid];
}
