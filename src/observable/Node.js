import { setPropertyValue, clone } from '../util/stdlib';
import * as Attribute from './Attribute';
import * as Template from '../view/Template';

function isInput($node) {
  const nodeName = $node.nodeName;
  return nodeName === 'INPUT' || nodeName === 'TEXTAREA' || nodeName === 'SELECT';
}

function setValue($node, value, attr = 'value') {
  const { type } = $node;
  if (type === 'checkbox' || type === 'radio') {
    attr = 'checked';
    if (type === 'radio') {
      value = $node.value === value;
    }
  } else if (type === 'file') {
    attr = 'files';
  }
  if ($node[attr] !== value) {
    $node[attr] = value;
    $node.dispatchEvent(new Event('mutate'));
  }
}

function evalValue(target) {
  if (target.type === 'radio') {
    return target.checked ? target.value : null;
  }
  if (target.type === 'file' && target.files) {
    return target.files;
  }
  if (target.type === 'checkbox') {
    return target.checked;
  }
  return target.value || null;
}

function changeContent(property, prop, value) {
  const state = clone(property.value);
  setPropertyValue(property, prop, value);
  value = property.value;
  property.nodes.forEach((node) => {
    execute(node, state, value);
  });
  property.attributes.forEach((attr) => {
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
  let { value } = property;
  let complexType = null;
  if (value instanceof Object) {
    value = getObjectValue(value, prop);
  }
  if (isInput($node)) {
    const inputValue = evalValue($node);
    $node.addEventListener('keyup', (e) => changeContent(property, prop, e.target.value));
    $node.addEventListener('change', (e) => changeContent(property, prop, evalValue(e.target)));
    if (inputValue === null) {
      setValue($node, value);
    } else {
      value = inputValue;
    }
  } else if ($node.tagName === 'SCRIPT' && $node.type === 'text/template') {
    complexType = Template.create(property.parent, $node.parentNode, $node);
    value = Template.getValue(complexType);
  } else if ($node.innerHTML) {
    const $template = $node.querySelector('script[type="text/template"]');
    value = $node.innerHTML;
    if ($template) {
      complexType = Template.create(property.parent, $node, $template);
      value = Template.getValue(complexType);
    }
  } else {
    setValue($node, value, 'innerHTML');
  }
  setPropertyValue(property, prop, value);
  return { prop, $node, complexType };
}

export function execute(node, state, value) {
  const { $node, complexType } = node;
  const attr = isInput($node) ? 'value' : 'innerHTML';
  node.prop.forEach((prop) => {
    value = value[prop];
    state = state[prop];
  });
  if (value !== state) {
    complexType && value ?
    Template.render(complexType, value) :
    setValue($node, value, attr);
  }
}
