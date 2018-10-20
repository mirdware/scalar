function htmlEscape(str) {
  return str.replace(/&/g, '&amp;')
    .replace(/>/g, '&gt;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

export class Template {
  constructor(fn) {
    this.fn = (data) => data.map(fn);
  }

  render(...params) {
    let template = this.fn.apply(this, params);
    if (Array.isArray(template)) {
      template = template.join('');
    }
    return template;
  }

  static html(literalSections, ...substs) {
    const raw = literalSections.raw;
    let result = '';
    substs.forEach((subst, i) => {
      let lit = raw[i];
      if (Array.isArray(subst)) {
        subst = subst.join('');
      }
      if (lit.endsWith('$')) {
        subst = htmlEscape(subst);
        lit = lit.slice(0, -1);
      }
      result += lit + subst;
    });
    result += raw[raw.length-1];
    return result;
  }
}
