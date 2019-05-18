const cache = {};

export function escapeHTML(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

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
      .replace(/\$\{([\s]*[^;\s\{]+[\s]*)\}/g, function(_, match){
        return `\$\{map.${match.trim()}\}`;
      })
      .replace(/(\$\{(?!map\.)[^}]+\})/g, '');
    fn = cache[template] = Function('map, index', `${escapeHTML} map = {index: index, data: map}; return ${html}\`${sanitized}\``);
  }
  return fn;
}

export class Template {
  constructor(node) {
    let template = node.getElementsByTagName('template');
    if (template.length) {
      template = template[0].innerHTML;
      this.fn = generateTemplate(template);
    }
  }

  render(param) {
    let template = '';
    if (this.fn) {
      const fn = Array.isArray(param) ? (data) => data.map(this.fn) : this.fn;
      template = fn(param);
      if (Array.isArray(template)) {
        template = template.join('');
      }
    }
    return template;
  }
}
