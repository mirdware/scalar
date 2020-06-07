import { addListeners, setPropertyValue } from '../util/stdlib';

function setAttribute($attribute, name, property) {
  if (property.constructor === Object) {
    for (const k in property) {
      setAttribute($attribute[name], k, property[k]);
    }
  } else if ($attribute[name] !== property) {
    $attribute[name] = property;
  }
}

function getPropertyValue(value, properties) {
  for (let i = 0, prop; prop = properties[i]; i++) {
    if (!value[prop]) return false;
    value = value[prop];
  }
  return value;
}

export function create(property, name, $element, prop, exp) {
  const keys = name.split('.');
  const { value } = property;
  let $attribute = $element;
  name = keys.pop();
  keys.forEach((k) => {
    $attribute = $attribute[k];
  });
  const attribute = { name, $attribute, $element, prop, exp };
  exp || getPropertyValue(value, prop) ? execute(property, attribute, value) : setPropertyValue(property, prop, $attribute[name]);
  return attribute;
}

export function execute(property, attribute, value) {
  const { $element, name } = attribute;
  const { eventListenerList } = $element;
  const { parent } = property;
  value = attribute.exp ?
  Function('p', 'return ' + attribute.exp)(property.component) :
  getPropertyValue(value, attribute.prop);
  setAttribute(attribute.$attribute, name, value);
  if (eventListenerList && name.indexOf('class') === 0 || name === 'id') {
    while (eventListenerList.length) {
      const listener = eventListenerList.shift();
      $element.removeEventListener(listener.name, listener.fn, listener.opt);
    }
    addListeners(parent.$node, parent.events);
  }
}
