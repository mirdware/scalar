import { addListeners } from '../util/stdlib';

function setAttribute($attribute, name, property) {
  if (property.constructor === Object) {
    for (const k in property) {
      setAttribute($attribute[name], k, property[k]);
    }
  } else if ($attribute[name] !== property) {
    $attribute[name] = property;
  }
}

export function execute(property, attribute, value) {
  const { $element } = attribute;
  const { eventListenerList } = $element;
  const { parent } = property;
  if (attribute.exp) {
    value = Function('p', `return ${attribute.exp}`)(property.component);
  } else {
    attribute.prop.forEach((prop) => value = value[prop]);
  }
  setAttribute(attribute.$attribute, attribute.name, value);
  if (eventListenerList) {
    while (eventListenerList.length) {
      const listener = eventListenerList.shift();
      $element.removeEventListener(listener.name, listener.fn, true);
    }
  }
  addListeners(parent.$node, parent.events);
}
