import { addListeners } from '../util/stdlib';

function setAttribute($attribute, name, property) {
  if (property.constructor === Object) {
    for (let k in property) {
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
  attribute.prop.forEach((prop) => value = value[prop]);
  setAttribute(attribute.$attribute, attribute.name, value);
  while (eventListenerList.length) {
    const listener = eventListenerList.shift();
    $element.removeEventListener(listener.name, listener.fn, true);
  }
  addListeners(parent.$node, parent.events);
}
