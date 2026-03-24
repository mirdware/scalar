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
export const nodeContext = new WeakMap();

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
  .replace(/&/g, '(?:&amp;|&)')
  .replace(/\\\$\\\{data(\\\.)?(\w|(\\\.))*\\\}/g, '(.*?)')
  .replace(/\\\$\\\{[^\}]*\}/g, '.*?')
  .replace(/ /g, '\\s*'), 'g');
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
  const fn = Function('data,index', 'return `' + template.t + '`');
  let $fragment;
  if (Array.isArray(param)) {
    $fragment = createFragment(param.map(fn).join(''));
    let index = 0;
    for (let i = 0, $node; $node = $fragment.childNodes[i]; i++) {
      if ($node.nodeType === 1) {
        nodeContext.set($node, param[index++]);
      }
    }
  } else {
    $fragment = createFragment(fn(param));
    nodeContext.set($fragment.firstElementChild, param);
  }
  updateNodes(
    property,
    $node,
    $fragment
  );
  $node.dispatchEvent(new Event('mutate'));
  watch(property.c, property.pc, $node);
}

export function createFragment(str) {
  const range = document.createRange();
  range.selectNodeContents(document.createElement('template'));
  return range.createContextualFragment(str);
}
