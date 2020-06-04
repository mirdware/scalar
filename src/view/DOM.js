function updateProps(property, $target, newProps, oldProps) {
  for (let i = 0, oldProp; oldProp = oldProps[i]; i++) {
    const { name } = oldProp;
    const newProp = newProps.getNamedItem(name);
    if (!newProp || newProp.value !== oldProp.value) {
      if (name === 'data-bind') removeNode(property, $target);
      newProp ? $target.setAttribute(name, newProp.value) : $target.removeAttribute(name);
    } else {
      newProps.removeNamedItem(name);
    }
  }
  for (let i = 0, newProp; newProp = newProps[i]; i++) {
    $target.setAttribute(newProp.name, newProp.value);
  }
}

function removeNode(property, $node) {
  const name = $node.getAttribute('data-bind');
  if (!name || $node.tagName === 'SCRIPT') return;
  const { nodes } = property.parent.properties[name.split('.')[0]];
  const node = nodes.find((node) => node.$node === $node);
  nodes.splice(nodes.indexOf(node), 1);
}

function removeNodes(property, $node) {
  if ($node.nodeType === 3) return;
  const $childrens = $node.querySelectorAll('[data-bind]');
  for (let i = 0, $child; $child = $childrens[i]; i++) {
    removeNode(property, $child);
  }
  removeNode(property, $node);  
}

function updateElement(property, $parent, $newNode, $oldNode, index) {
  index = index || 0;
  if (!$oldNode) {
    $parent.appendChild($newNode);
  } else if (!$newNode) {
    $parent.removeChild($oldNode);
    removeNodes(property, $oldNode);
  } else if (
    $newNode.nodeType !== $oldNode.nodeType ||
    $newNode.nodeType === 3 && $newNode.nodeValue !== $oldNode.nodeValue ||
    $newNode.tagName !== $oldNode.tagName
  ) {
    $parent.replaceChild($newNode, $oldNode);
    removeNodes(property, $oldNode);
  } else if ($newNode.nodeType !== 3) {
    updateProps(property, $parent.childNodes[index], $newNode.attributes, $oldNode.attributes);
    updateNodes(property, $oldNode, $newNode);
  }
}

export function updateNodes(property, $parent, $path) {
  const oldNodes = Array.from($parent.childNodes);
  const newNodes = Array.from($path.childNodes);
  for (let i = 0; i < newNodes.length || i < oldNodes.length; i++) {
    updateElement(property, $parent, newNodes[i], oldNodes[i], i);
  }
}
