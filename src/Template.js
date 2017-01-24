function htmlEscape(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

export class Template {
  constructor(tpl) {
    this.tpl = tpl;
  }

  render(...params) {
    let template = this.tpl.apply(this, params);
    if (Array.isArray(template)) {
      template = template.join('');
    }
    return template;
  }

  static html(literalSections, ...substs) {
    let raw = literalSections.raw;
    let result = '';
    for (let i=0, subst; subst = substs[i]; i++) {
      let lit = raw[i];
      if (Array.isArray(subst)) {
        subst = subst.join('');
      }
      if (lit.endsWith('$')) {
        subst = htmlEscape(subst);
        lit = lit.slice(0, -1);
      }
      result += lit + subst;
    }
    result += raw[raw.length-1];
    return result;
  }
}
