import { setPropertyValue } from '../util/Element';
import { watch } from "../observable/Component";
import { updateNodes } from './DOM'; 

const cache = {};

function clean (str) {
  return str.replace(/\s+/g, ' ')
  .replace(/<\s/g, '<')
  .replace(/\s?\/?\s?>/g, '>');
}

export function create(property, $node, $template) {
  return {
    property,
    $node,
    tpl: clean($template.innerHTML),
    base: clean($node.innerHTML
    .replace($template.outerHTML, ''))
  };
}

export function getValue(template) {
  const keys = [];
  const value = [];
  let regex = /\$\{data\.([\w\d\.]*)\}/g;
  let matches;
  while ((matches = regex.exec(template.tpl)) !== null) {
    keys.push(matches[1]);
  }
  if (!keys.length) return value;
  regex = new RegExp(template.tpl.trim()
  .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  .replace(/ /g, '\\s?')
  .replace(/\\\$\\\{data\\\.[\w(\\\.)_]*\\\}/g, '(.*?)')
  .replace(/\\\$\\\{.*?\\\}/g, '.*?'), 'g');
  while ((matches = regex.exec(template.base)) !== null) {
    const obj = {};
    keys.forEach((key, i) => {
      setPropertyValue(obj, key.split('.'), matches[i + 1]);
    });
    value.push(obj.value);
  }
  return value;
}

export function render({ $node, tpl, property }, param) {
  const fragment = document.createElement('template');
  if (!cache[tpl]) {
    cache[tpl] = Function('data,index', 'return `' + tpl + '`');
  }
  fragment.innerHTML = Array.isArray(param) ? param.map(cache[tpl]).join('') : cache[tpl](param);
  updateNodes(property, $node, fragment.content);
  $node.dispatchEvent(new Event('mutate'));
  watch(property.component, property.parent, $node);
}
