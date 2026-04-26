import { setValue } from '../util/Element';
import { watch } from "../observable/Component";
import { get } from '../observable/Property';
import { updateNodes } from './DOM';
/**
 *
 * @var {template.p} property Propiedad que contiene la plantilla
 * @var {template.$} $node Elemento HTML que sera renderizado por la plantilla
 * @var {template.$t} $template Plantilla como elemento HTML
 * @var {template.t} template Plantilla a renderizar
 * @var {template.ip} isParing Valida si la platilla de debe emparejar
 * @var {template.b} base Plantilla base?
 */
export const nodeContext = new WeakMap();
const range = document.createRange();
range.selectNodeContents(document.createElement('template'));

function populateContext($node, property, value) {
  for (let i = 0, index = 0, $child; $child = $node.childNodes[i]; i++) {
    if ($child.nodeType === 1 && $child.tagName !== 'SCRIPT') {
      nodeContext.set($child, get(property, value[index++]));
    }
  }
}

function normalize(str) {
  return str
  .replace(/\s+/g, ' ')
  .replace(/<\s/g, '<')
  .replace(/\s?\/?\s?>/g, '>');
}

export function create(property, $node, $template) {
  const template = normalize($template.innerHTML);
  return {
    p: property,
    $: $node,
    $t: $template,
    ip: $template.hasAttribute('data-pairing'),
    t: template,
    f: Function('data,index', 'return `' + template + '`'),
    b: normalize($node.innerHTML.replace($template.outerHTML, ''))
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
  .replace(/ ([\w-]+)(?=[ >])/g, ' $1(?:="")?')
  .replace(/ /g, '\\s*'), 'g');
  while ((matches = regex.exec(template.b)) !== null) {
    const obj = {};
    keys.forEach((key, i) => {
      setValue(obj, key ? key.split('.') : key, matches[i + 1]);
    });
    value.push(obj.v);
  }
  populateContext(template.$, template.p, value);
  return value;
}

export function render(template, param) {
  param = param?.forEach ? Array.from(param) : param != null ? [param] : [];
  const { $: $node, p: property } = template;
  const $fragment = createFragment(param.map(template.f).join(''));
  $fragment.appendChild(template.$t);
  populateContext($fragment, property, param);
  updateNodes(property, $node, $fragment);
  $node.dispatchEvent(new Event('mutate', { bubbles: true, composed: true }));
  watch(property.c, property.pc, $node);
}

export function createFragment(str) {
  return range.createContextualFragment(str);
}
