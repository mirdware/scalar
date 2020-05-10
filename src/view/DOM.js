function updateProps(property, $target, newProps, oldProps) {
  for (let i = 0, newProp; newProp = newProps[i]; i++) {
    $target.setAttribute(newProp.name, newProp.value);
  }
  for (let i = 0, oldProp; oldProp = oldProps[i]; i++) {
    const { name } = oldProp;
    if (!newProps[name]) {
      $target.removeAttribute(name);
      if (name === 'data-bind') removeNode(property, $target);
    }
  }
}

function changed($newNode, $oldNode) {
  return $newNode.nodeType !== $oldNode.nodeType ||
  $newNode.nodeType === 3 && $newNode.nodeValue !== $oldNode.nodeValue ||
  $newNode.tagName !== $oldNode.tagName;
}

function removeNode(property, $node) {
  const { properties } = property.parent;
  for (const key in properties) {
    const nodes = properties[key].nodes;
    nodes.forEach((node, index) => {
      const $element = node.$node;
      if ($element === $node && $element.tagName !== 'SCRIPT') {
        nodes.splice(index, 1);
      }
    });
  }
}

function updateElement(property, $parent, $newNode, $oldNode, index) {
  index = index || 0;
  if (!$oldNode) {
    $parent.appendChild($newNode);
  } else if (!$newNode) {
    $parent.removeChild($oldNode);
    removeNode(property, $oldNode);
  } else if (changed($newNode, $oldNode)) {
    $parent.replaceChild($newNode, $oldNode);
    removeNode(property, $oldNode);
  } else if ($newNode.nodeType !== 3) {
    updateProps(property, $parent.childNodes[index], $newNode.attributes, $oldNode.attributes);
    updateNodes(property, $parent.childNodes[index], $newNode, $oldNode);
  }
}

function toArray($parent) {
  const array = [];
  for (let i = 0, $node; $node = $parent.childNodes[i]; i++) {
    array.push($node);
  }
  return array;
}

export function updateNodes(property, $parent, $path) {
  const oldNodes = toArray($parent);
  const newNodes = toArray($path);
  for (let i = 0; i < newNodes.length || i < oldNodes.length; i++) {
    updateElement(property, $parent, newNodes[i], oldNodes[i], i);
  }
}
