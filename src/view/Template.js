import { addListeners } from "../util/stdlib";
import { updateNodes } from './DOM'; 

const cache = {};

export function create(component, $node, $template) {
  const regex = /\/?\s*>\s+<\s*/g;
  return {
    component,
    $node,
    tpl: $template.innerHTML.trim()
    .replace(regex, '> <'),
    base: $node.innerHTML.trim()
    .replace($template.outerHTML, '')
    .replace(regex, '> <')
  };
}

export function getValue(template) {
  const value = [];
  let keys = template.tpl.match(/\$\{data\.[\w\d\.]*\}/g);
  if (!keys) return value;
  keys = keys.map((data) => (data.replace('${data.', '').replace('}', '')));
  const regex = new RegExp(template.tpl
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

export function render({ $node, tpl, component }, param) {
  let fn = cache[tpl];
  if (!fn){
    fn = cache[tpl] = Function('data,index', 'return `' + tpl + '`');
  }
  const fragment = document.createElement('template');
  fragment.innerHTML = Array.isArray(param) ? param.map(fn).join('') : fn(param);
  updateNodes($node, fragment.content.childNodes);
  $node.dispatchEvent(new Event('mutate'));
  addListeners($node, component.events, false);
}
