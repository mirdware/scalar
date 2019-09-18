import { generateUUID } from './stdlib';

const correlation = {};

export function set(obj, props) {
  let { uuid } = obj;
  if (!uuid) {
    uuid = generateUUID(obj);
  }
  correlation[uuid] = props;
  return uuid;
}

export function get(obj) {
  let { uuid } = obj;
  if (!uuid) {
    uuid = set(obj, {});
  }
  return correlation[uuid];
}
