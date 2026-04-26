const internal = new WeakMap();

export function set(object, properties) {
  internal.set(object, properties);
}

export function get(object) {
  if (!internal.has(object)) {
    set(object, {});
  }
  return internal.get(object);
}
