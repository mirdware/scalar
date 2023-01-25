import { setPropertyValue, clone } from '../util/Element';
import * as Attribute from './Attribute';
import * as Template from '../view/Template';
/**
 *
 * @var {node.ct} complexType Define cuando una propiedad es un array
 * @var {node.$} $node Elemento HTML que es encapsulado por el nodo
 * @var {node.pn_} propertyNames Nombres que componen el nombre del nodo?
 * @var {property.v} value Valor de la propiedad
 * @var {property.n_} nodes Elementos del dom que se controlan mediante la propiedad
 * @var {property.a_} attributes Atributos que controla la propiedad
 */
function isInput({ nodeName }) {
  return nodeName === 'INPUT' || nodeName === 'TEXTAREA' || nodeName === 'SELECT';
}

function setValue($node, value, attr) {
  const { type } = $node;
  if (type === 'checkbox' || type === 'radio') {
    attr = 'checked';
    if (type === 'radio') {
      value = $node.value === value;
    }
  } else if (type === 'file') {
    attr = 'files';
  } else if (type === 'select-multiple') {
    for (let i = 0, option; option = $node.options[i]; i++) {
      if (value.find((v) => v === option.value)) {
        option.selected = true;
      }
    }
    return;
  }
  if (value instanceof Date && !isNaN(value)) {
    value = new Date(value.getTime() - value.getTimezoneOffset() * 60000)
    .toJSON().slice(0, type === 'date' ? 10 : 16);
  }
  if ($node[attr] !== value) {
    $node[attr] = value;
    $node.dispatchEvent(new Event('mutate'));
  }
}

function evalValue({type, checked, value, files, selectedOptions}) {
  if (type === 'select-multiple') return Array.from(selectedOptions).map(({ value }) => value);
  if (type === 'radio') return checked ? value : null;
  if (type === 'file' && files) return files;
  if (type === 'checkbox') return checked;
  return value || null;
}

function changeContent(property, prop, value) {
  const state = clone(property.v);
  setPropertyValue(property, prop, value);
  value = property.v;
  property.n_.forEach((node) => {
    execute(node, state, value);
  });
  property.a_.forEach((attr) => {
    Attribute.execute(property, attr, value);
  });
}

function getObjectValue(obj, props) {
  for (let i = 0, prop; prop = props[i]; i++) {
    if (!obj[prop]) return '';
    obj = obj[prop];
  }
  return obj;
}

export function create(property, $node, prop) {
  let value = property.v;
  let complexType = null;
  if (value instanceof Object) {
    value = getObjectValue(value, prop);
  }
  if (isInput($node)) {
    const inputValue = evalValue($node);
    $node.addEventListener('keyup', (e) => {
      changeContent(property, prop, evalValue(e.target));
    });
    $node.addEventListener('change', (e) => {
      changeContent(property, prop, evalValue(e.target));
    });
    if (inputValue === null) {
      setValue($node, value, 'value');
    } else {
      value = inputValue;
    }
  } else if ($node.tagName === 'SCRIPT' && $node.type === 'text/template') {
    complexType = Template.create(property, $node.parentNode, $node);
    value = Template.getValue(complexType);
  } else if ($node.innerHTML) {
    const $template = $node.querySelector('script[type="text/template"]');
    value = $node.innerHTML;
    if ($template) {
      complexType = Template.create(property, $node, $template);
      value = Template.getValue(complexType);
    }
  } else {
    setValue($node, value, 'innerHTML');
  }
  setPropertyValue(property, prop, value);
  return { pn_: prop, $: $node, ct: complexType };
}

export function execute(node, state, value) {
  const $node = node.$;
  const complexType = node.ct;
  node.pn_.forEach((propName) => {
    value = value[propName];
    state = state[propName];
  });
  if (value !== state) {
    complexType && value ?
    Template.render(complexType, value) :
    setValue($node, value, isInput($node) ? 'value' : 'innerHTML');
  }
}
