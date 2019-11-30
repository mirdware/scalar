import { addListeners } from "../util/stdlib";

const cache = {};

function generateTemplate(template, param) {
  let fn = cache[template];
  if (!fn){
    fn = cache[template] = Function(
      'data,index', `return \`${template}\``
    );
  }
  template = Array.isArray(param) ? param.map(fn) : fn(param);
  if (Array.isArray(template)) return template.join('');
  return template;
}

export default class Template {
  constructor(component, $node) {
    let $template = $node.querySelector('script[type="text/template"]');
    this.component = component;
    this.$node = $node;
    if ($template) {
      this.tpl = $template.innerHTML;
      this.base = $node.innerHTML.trim()
      .replace($template.outerHTML, '')
      .replace(/>\s*</g, '><');
    }
  }

  getValue() {
    const value = [];
    if (!this.tpl) return value;
    const keys = [];
    const regex = new RegExp(this.tpl.trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\$\\\{data\\\.[\w\d\.]*\\\}/g, '([^<]*)')
    .replace(/\\\$\\\{[^\}]*\\\}/g, '[^<]*')
    .replace(/>\s*</g, '><'), 'g');
    this.tpl.match(/\$\{data\.[\w\d\.]*\}/g)
    .forEach((data) => {
      keys.push(data.replace('${data.', '').replace('}', ''));
    });
    let matches;
    while ((matches = regex.exec(this.base)) !== null) {
      const obj = {};
      keys.forEach((key, i) => {
        obj[key] = matches[i + 1];
      });
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
