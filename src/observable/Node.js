import { setPropertyValue, getPropertyValue, clone } from '../util/Element';
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
const queue = new Map();
let pending;

function isInput({ nodeName }) {
  return nodeName === 'INPUT' || nodeName === 'TEXTAREA' || nodeName === 'SELECT';
}

function setValue($node, value, attr) {
  const { type } = $node;
  if (type === 'select-multiple') {
    for (let i = 0, option; option = $node.options[i]; i++) {
      option.selected = value.find((v) => v === option.value);
    }
    return;
  }
  if (type === 'checkbox' || type === 'radio') {
    attr = 'checked';
    if (type === 'radio') {
      value = $node.value === value;
    }
  } else if (type === 'file') {
    attr = 'files';
  }
  if (value instanceof Date && !isNaN(value)) {
    const iso = new Date(value.getTime() - value.getTimezoneOffset() * 60000).toJSON();
    value = type === 'date' ? iso.slice(0, 10)
          : type === 'time' ? iso.slice(11, 16)
          : iso.slice(0, 16);
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

export function changeContent(property, value, state) {
  property.v = value;
  queue.set(property, { v: value, s: state });
  if (!pending) {
    pending = 1;
    Promise.resolve().then(() => {
      queue.forEach(({ v, s }, property) => {
        property.n_.forEach((node) => {
          execute(node, s, v);
        });
        property.a_.forEach((attr) => {
          Attribute.execute(property, attr, v);
        });
        property.c_.forEach(function (fn) { fn() });
      })
      queue.clear();
      pending = 0;
    });
  }
  return true;
}

export function create(property, $node, prop) {
  let value = property.v;
  let complexType = null;
  if (value instanceof Object) {
    value = getPropertyValue(value, prop);
  }
  if (isInput($node)) {
    const inputValue = evalValue($node);
    const changeHandler = function (e) {
      const state = clone(property.v);
      setPropertyValue(property, prop, evalValue(e.target));
      changeContent(property, property.v, state);
    };
    if (!$node.eventListenerList) {
      $node.eventListenerList = [];
    }
    if (!['date', 'time', 'month', 'week', 'datetime-local'].includes($node.type)) {
      $node.addEventListener('keyup', changeHandler);
      $node.eventListenerList.push({ name: 'keyup', fn: changeHandler, opt: false });
    }
    $node.addEventListener('change', changeHandler);
    $node.eventListenerList.push({ name: 'change', fn: changeHandler, opt: false });
    if (inputValue === null) {
      setValue($node, value, 'value');
    } else {
      value = inputValue;
    }
  } else if ($node.tagName === 'SCRIPT' && $node.type === 'text/template') {
    complexType = Template.create(property, $node.parentNode, $node);
    value = Template.getValue(complexType);
  } else if ($node.innerHTML) {
    const $template = $node.querySelector(':scope>script[type="text/template"]');
    value = $node.innerHTML;
    if ($template) {
      complexType = Template.create(property, $node, $template);
      value = Template.getValue(complexType);
    }
  } else {
    setValue($node, value, 'innerText');
  }
  setPropertyValue(property, prop, value);
  return { pn_: prop, $: $node, ct: complexType };
}

export function execute(node, state, value) {
  const { $: $node, ct: complexType, pn_: properties } = node;
  value = getPropertyValue(value, properties);
  state = getPropertyValue(state, properties);
  if (value !== state) {
    complexType && value ?
    Template.render(complexType, value) :
    setValue($node, value, isInput($node) ? 'value' : 'innerText');
  }
}
