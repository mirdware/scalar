import { setPropertyValue } from '../util/Element';
import { watch } from "../observable/Component";
import { updateNodes } from './DOM';
/**
 *
 * @var {template.p} property Propiedad que contiene la plantilla
 * @var {template.$} $node Elemento HTML que sera renderizado por la plantilla
 * @var {template.t} template Plantilla a renderizar
 * @var {template.ip} isParing Valida si la platilla de debe emparejar
 * @var {template.b} base Plantilla base?
 */
const cache = {};

export function create(property, $node, $template) {
  return {
    p: property,
    $: $node,
    ip: $template.hasAttribute('data-pairing'),
    t: $template.innerHTML
    .replace(/\s+/g, ' ')
    .replace(/<\s/g, '<')
    .replace(/\s?\/?\s?>/g, '>'),
    b: $node.innerHTML
    .replace($template.outerHTML, '')
    .replace(/\s+/g, ' ')
    .replace(/<\s/g, '<')
    .replace(/\s?\/?\s?>/g, '>')
  };
}

export function getValue(template) {
  const keys = [];
  const value = [];
  let regex = /\$\{data(?:\.)?([\w\.]*)\}/g;
  let matches;
  while ((matches = regex.exec(template.t)) !== null) {
    keys.push(matches[1]);
  }
  if (!template.ip || !keys.length) return value;
  regex = new RegExp(template.t.trim()
  .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  .replace(/\\\$\\\{data(\\\.)?(\w|(\\\.))*\\\}/g, '(.*?)')
  .replace(/\\\$\\\{[^\}]*\}/g, '.*?')
  .replace(/ /g, '\\s*').replace('&', '[?&]amp;'), 'g');
  while ((matches = regex.exec(template.b)) !== null) {
    const obj = {};
    keys.forEach((key, i) => {
      setPropertyValue(obj, key ? key.split('.') : key, matches[i + 1]);
    });
    value.push(obj.v);
  }
  return value;
}

export function render(template, param) {
  const $node = template.$;
  const property = template.p;
  template = template.t;
  if (!cache[template]) {
    cache[template] = Function('data,index', 'return `' + template + '`');
  }
  updateNodes(
    property,
    $node,
    createFragment(Array.isArray(param) ? param.map(cache[template]).join('') : cache[template](param))
  );
  $node.dispatchEvent(new Event('mutate'));
  watch(property.c, property.pc, $node);
}

export function createFragment(str) {
  const range = document.createRange();
  range.selectNodeContents(document.createElement('template'));
  return range.createContextualFragment(str);
}
