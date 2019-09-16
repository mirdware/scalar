import { isInput, addListeners } from '../util/stdlib';
import { escapeHTML } from '../view/Template';

const proxies = [];
const getHandler = (property, root) => ({
  set: (target, prop, value) => {
    root = root || target;
    if (value instanceof Promise) {
      return value.then((data) => {
        if (Reflect.set(target, prop, data)) {
          property.set(root);
        }
      });
    }
    if (Reflect.set(target, prop, value)) {
      return property.set(root);
    }
    return false;
  },
  get: (target, prop, receiver) => {
    const obj = target[prop];
    if (obj && obj.constructor === Object) {
      let proxy = proxies.find((p) => p.obj === obj);
      if (!proxy) {
        proxy = { obj, prox: new Proxy(obj, getHandler(property, root || target)) };
        proxies.push(proxy);
      }
      return proxy.prox;
    }
    return Reflect.get(target, prop, receiver);
  }
});

function executeNode(property, node, value) {
  const { $node, complexType } = node;
  const attr = isInput($node) ? 'value': 'innerHTML';
  node.prop.forEach((prop) => value = value[prop]);
  if (complexType && value && attr === 'innerHTML') {
    return complexType.render(value);
  }
  property.setValue($node, value, attr);
}

function executeAttribute(property, attribute, value) {
  const { $element } = attribute;
  const { eventListenerList } = $element;
  const { parent } = property;
  setAttribute(attribute.$attribute, attribute.name, value);
  while (eventListenerList.length) {
    const listener = eventListenerList.shift();
    $element.removeEventListener(listener.name, listener.fn, true);
  }
  addListeners(parent.$node, parent.events);
}

function setAttribute($attribute, name, property) {
  if (property.constructor === Object) {
    for (let k in property) {
      setAttribute($attribute[name], k, property[k]);
    }
  } else if ($attribute[name] !== property) {
    $attribute[name] = property;
  }
}

function formatInitAttribute(attr) {
  return (attr instanceof CSSStyleDeclaration) ? attr.cssText : attr;
}

function changeContent(property, value) {
  property.value = value;
  property.attributes.forEach((attr) => executeAttribute(property, attr, value));
  property.nodes.forEach((node) => executeNode(property, node, value));
  return true;
}

function getObject(obj, props, value, i = 0) {
  const prop = obj[props[i]];
  obj[props[i]] = ++i < props.length ?
  getObject(prop || {}, props, value, i) :
  value;
  return obj;
}

export default class Property {
  constructor(parent) {
    this.parent = parent;
    this.value = '';
    this.nodes = [];
    this.attributes = [];
  }

  get() {
    let value = this.value;
    const constructor = value.constructor;
    if (constructor === Array || constructor === Object) {
      if (this.observable !== value) {
        this.proxy = new Proxy(value, getHandler(this));
        this.observable = value;
      }
      value = this.proxy;
    }
    return value;
  }

  set(value = '') {
    return value instanceof Promise ?
    value.then((data) => changeContent(this, data)) :
    changeContent(this, value);
  }

  setValue($node, value, attr = 'value') {
    if (attr === 'innerHTML' && typeof value == 'string') {
      value = escapeHTML(value);
    } else if ($node.type === 'checkbox' || $node.type === 'radio') {
      attr = 'checked';
      if ($node.type === 'radio') {
        value = $node.value === this.get();
      }
    } else if ($node.type === 'file') {
      attr = 'files';
    }
    if ($node[attr] !== value) $node[attr] = value;
  }

  addNode(prop, $node, complexType, value) {
    this.nodes.push({ prop, $node, complexType });
    if (prop.length) {
      if (!this.value) {
        this.value = {};
      }
      getObject(this.value, prop, value);
    } else if (value) {
      this.value = value;
    }
  }

  addAttribute(name, $element) {
    const keys = name.split('.');
    let $attribute = $element;
    name = keys.pop();
    keys.forEach((k) => $attribute = $attribute[k]);
    if ($attribute[name] && !this.get()) {
      this.set(formatInitAttribute($attribute[name]));
    }
    this.attributes.push({ name, $attribute, $element });
  }
}
