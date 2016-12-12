export class Template {
    constructor(tpl) {
        this.tpl = tpl;
    }

    render(obj) {
        return this.tpl(obj);
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
            result += lit;
            result += subst;
        }
        result += raw[raw.length-1];
        return result;
    }
}

function htmlEscape(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/>/g, '&gt;')
              .replace(/</g, '&lt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
              .replace(/`/g, '&#96;');
}
