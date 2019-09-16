import { addListeners } from "../util/stdlib";

const cache = {};

function html(literalSections, ...substs) {
  const raw = literalSections.raw;
  let result = '';
  substs.forEach((subst, i) => {
    let lit = raw[i];
    if (Array.isArray(subst)) {
      subst = subst.join('');
    }
    if (lit.endsWith('$')) {
      subst = escapeHTML(subst);
      lit = lit.slice(0, -1);
    }
    result += lit + subst;
  });
  result += raw[raw.length-1];
  return result;
}

function generateTemplate(template) {
  let fn = cache[template];
  if (!fn){
    const sanitized = template
    .replace(/\$\{([\s]*[^;\s\{]+[\s]*)\}/g, (_, match) => `\$\{map.${match.trim()}\}`)
    .replace(/(\$\{(?!map\.)[^}]+\})/g, '');
    fn = cache[template] = Function(
      'data, index',
      `${escapeHTML}map={index, data};return ${html}\`${sanitized}\``
    );
  }
  return fn;
}

function parseTemplate(fn, param) {
  if (fn) {
    const template = Array.isArray(param) ? param.map(fn) : fn(param);
    if (Array.isArray(template)) return template.join('');
    return template;
  }
  return '';
}

export function escapeHTML(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

export default class Template {
  constructor(component, $node) {
    const $template = $node.getElementsByTagName('template');
    this.component = component;
    this.$node = $node;
    if ($template.length) {
      this.fn = generateTemplate($template[0].innerHTML);
    }
  }

  getValue() {
    return [];
  }

  render(param) {
    const { $node, component, fn } = this;
    $node.innerHTML = parseTemplate(fn, param);
    addListeners($node, component.events, false);
  }
}
