import { setPropertyValue } from '../util/stdlib';
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
  if ($node[attr] !== value) $node[attr] = value;
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

export function create(property, $node, prop, set) {
  let { value } = property;
  let complexType = null;
  if (isInput($node)) {
    const inputValue = evalValue($node);
    $node.addEventListener('keyup', (e) => set(property, e.target.value));
    $node.addEventListener('change', (e) => set(property, evalValue(e.target)));
    if (inputValue === null) {
      setValue($node, value);
    } else {
      value = inputValue;
    }
  } else if ($node.innerHTML) {
    const $template = $node.querySelector('script[type="text/template"]');
    if ($template) {
      complexType = Template.create(property.parent, $node, $template);
      value = Template.getValue(complexType);
    } else {
      value = $node.innerHTML;
    }
  } else {
    setValue($node, value, 'innerHTML');
  }
  setPropertyValue(property, prop, value);
  return { prop, $node, complexType };
}

export function execute(node, value) {
  const { $node, complexType } = node;
  const attr = isInput($node) ? 'value': 'innerHTML';
  node.prop.forEach((prop) => value = value[prop]);
  if (complexType && value && attr === 'innerHTML') {
    return Template.render(complexType, value);
  }
  setValue($node, value, attr);
}
