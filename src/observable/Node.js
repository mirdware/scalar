import { isInput, setValue } from '../util/stdlib';

export function execute(node, value) {
  const { $node, complexType } = node;
  const attr = isInput($node) ? 'value': 'innerHTML';
  node.prop.forEach((prop) => value = value[prop]);
  if (complexType && value && attr === 'innerHTML') {
    return complexType.render(value);
  }
  setValue($node, value, attr);
}
