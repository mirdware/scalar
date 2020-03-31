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

export function create(property, name, $element, prop, exp) {
  const keys = name.split('.');
  let $attribute = $element;
  name = keys.pop();
  keys.forEach((k) => {
    $attribute = $attribute[k];
  });
  const attribute = { name, $attribute, $element, prop, exp };
  exp ? execute(property, attribute) : setPropertyValue(property, prop, $attribute[name]);
  return attribute;
}

export function execute(property, attribute, value) {
  const { $element } = attribute;
  const { eventListenerList } = $element;
  const { parent } = property;
  if (attribute.exp) {
    value = Function('p', 'return ' + attribute.exp)(property.component);
  } else {
    attribute.prop.forEach((prop) => {
      value = value[prop];
    });
  }
  setAttribute(attribute.$attribute, attribute.name, value);
  if (eventListenerList) {
    while (eventListenerList.length) {
      const listener = eventListenerList.shift();
      $element.removeEventListener(listener.name, listener.fn, listener.opt);
    }
  }
  addListeners(parent.$node, parent.events);
}
