import { setPropertyValue } from '../util/Element';
import { addListeners } from '../util/Event';
/**
 *
 * @var {attribute.n} name Nombre del atributo
 * @var {attribute.a} attribute Elemento del DOM que representa el atributo
 * @var {attribute.$} $element Elemento HTML al que pertenece el atributo
 * @var {attribute.pn} propertyName Nombre de la propiedad a la que pertenece el atributo
 * @var {attribute.exp} expression? Expresión que se debe evaluar para que tome el valor el atributo
 */
function setAttribute($attribute, name, property) {
  if (property && property.constructor === Object) {
    for (const key in property) {
      setAttribute($attribute[name], key, property[key]);
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
  const value = property.v;
  let $attribute = $element;
  name = keys.pop();
  keys.forEach((k) => {
    $attribute = $attribute[k];
  });
  const attribute = { n: name, a: $attribute, $: $element, pn: prop, exp };
  exp || getPropertyValue(value, prop) ? execute(property, attribute, value) : setPropertyValue(property, prop, $attribute[name]);
  return attribute;
}

export function execute(property, attribute, value) {
  const $element = attribute.$;
  const name = attribute.n;
  const { eventListenerList } = $element;
  const privyComponent = property.pc;
  value = attribute.exp ?
  Function('p', 'return ' + attribute.exp)(property.c) :
  getPropertyValue(value, attribute.pn);
  setAttribute(attribute.a, name, value);
  if (eventListenerList && name.indexOf('class') === 0 || name === 'id') {
    while (eventListenerList.length) {
      const listener = eventListenerList.shift();
      $element.removeEventListener(listener.name, listener.fn, listener.opt);
    }
    addListeners(privyComponent.$, privyComponent.e_);
  }
}
