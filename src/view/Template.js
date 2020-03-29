import { addListeners } from "../util/stdlib";

const cache = {};

export function create(component, $node, $template) {
  return {
    component,
    $node,
    tpl: $template.innerHTML,
    base: $node.innerHTML.trim()
    .replace($template.outerHTML, '')
    .replace(/>\s+</g, '><')
  };
}

export function getValue(template) {
  const value = [];
  let keys = template.tpl.match(/\$\{data\.[\w\d\.]*\}/g);
  if (!keys) return value;
  keys = keys.map((data) => (data.replace('${data.', '').replace('}', '')));
  const regex = new RegExp(template.tpl.trim()
  .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  .replace(/\\\$\\\{data\\\.[\w\d\.]*\\\}/g, '([^<]*)')
  .replace(/\\\$\\\{[^\}]*\\\}/g, '[^<]*')
  .replace(/\/?\s*>\s*<\s*/g, '><'), 'g');
  let matches;
  while ((matches = regex.exec(template.base)) !== null) {
    const obj = {};
    keys.forEach((key, i) => obj[key] = matches[i + 1]);
    value.push(obj);
  }
  return value;
}

export function render(template, param) {
  const { $node, tpl, component } = template;
  let fn = cache[tpl];
  if (!fn){
    fn = cache[tpl] = Function('data,index', 'return `' + tpl + '`');
  }
  template = Array.isArray(param) ? param.map(fn) : fn(param);
  $node.innerHTML = Array.isArray(template) ? template.join('') : template;
  addListeners($node, component.events, false);
}
