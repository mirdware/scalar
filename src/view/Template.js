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


export function create(component, $node, $template) {
  const template = { component, $node };
  if ($template) {
    template.tpl = $template.innerHTML;
    template.base = $node.innerHTML.trim()
    .replace($template.outerHTML, '')
    .replace(/>\s*</g, '><');
  }
  return template;
}

export function getValue(template) {
  const value = [];
  if (!template.tpl) return value;
  const keys = [];
  const regex = new RegExp(template.tpl.trim()
  .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  .replace(/\\\$\\\{data\\\.[\w\d\.]*\\\}/g, '([^<]*)')
  .replace(/\\\$\\\{[^\}]*\\\}/g, '[^<]*')
  .replace(/>\s*</g, '><'), 'g');
  template.tpl.match(/\$\{data\.[\w\d\.]*\}/g)
  .forEach((data) => {
    keys.push(data.replace('${data.', '').replace('}', ''));
  });
  let matches;
  while ((matches = regex.exec(template.base)) !== null) {
    const obj = {};
    keys.forEach((key, i) => {
      obj[key] = matches[i + 1];
    });
    value.push(obj);
  }
  return value;
}

export function render(template, param) {
  const { $node } = template;
  $node.innerHTML = generateTemplate(template.tpl, param);
  addListeners($node, template.component.events, false);
}
