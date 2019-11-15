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

function generateTemplate(template, param) {
  let fn = cache[template];
  if (!fn){
    fn = cache[template] = Function(
      'data,index', `${escapeHTML}return ${html}\`${template}\``
    );
  }
  template = Array.isArray(param) ? param.map(fn) : fn(param);
  if (Array.isArray(template)) return template.join('');
  return template;
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

export default class Template {
  constructor(component, $node) {
    let $template = $node.getElementsByTagName('template');
    this.component = component;
    this.$node = $node;
    if ($template.length) {
      $template = $template[0]; 
      this.tpl = $template.innerHTML;
      this.base = $node.innerHTML.trim()
      .replace($template.outerHTML,'')
      .replace(/>\s*</g, '><');
    }
  }

  getValue() {
    const value = [];
    const keys = [];
    const regex = new RegExp(this.tpl.trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/(\\\$)+\\\{[\w\\\.]+\\\}/g, '([^<]*)')
    .replace(/>\s*</g, '><'), 'g');
    const dataTpl = this.tpl.match(/\$+\{\w[\w\._\d\s]*\}/g);
    for (let i = 0; i < dataTpl.length; i++) {
      keys.push(dataTpl[i].replace(/^\$+\{data\./, '').replace('}', ''));
    }
    let matches;
    while ((matches = regex.exec(this.base)) !== null) {
      const obj = {};
      for (let i = 1; i < matches.length; i++) {
        obj[keys[i - 1]] = matches[i];
      }
      value.push(obj);
    }
    return value;
  }

  render(param) {
    const { $node } = this;
    $node.innerHTML = generateTemplate(this.tpl, param);
    addListeners($node, this.component.events, false);
  }
}
