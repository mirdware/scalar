import { watch } from "../observable/Component";
import { updateNodes } from './DOM'; 

const cache = {};

export function create(property, $node, $template) {
  const regex = /\/?\s*>\s+<\s*/g;
  return {
    property,
    $node,
    tpl: $template.innerHTML
    .replace(regex, '> <'),
    base: $node.innerHTML
    .replace($template.outerHTML, '')
    .replace(regex, '> <')
  };
}

export function getValue(template) {
  const value = [];
  let keys = template.tpl.match(/\$\{data\.[\w\d\.]*\}/g);
  if (!keys) return value;
  keys = keys.map((data) => (data.replace('${data.', '').replace('}', '')));
  const regex = new RegExp(template.tpl.trim()
  .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  .replace(/\\\$\\\{data\\\.[\w\d\.]*\\\}/g, '(.*?)')
  .replace(/\\\$\\\{[^\}]*\\\}/g, '.*?'), 'g');
  let matches;
  while ((matches = regex.exec(template.base)) !== null) {
    const obj = {};
    keys.forEach((key, i) => {
      obj[key] = matches[i + 1];
    });
    value.push(obj);
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
