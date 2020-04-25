function updateProps($target, newProps, oldProps) {
  for (let i = 0, newProp; newProp = newProps[i]; i++) {
    $target.setAttribute(newProp.name, newProp.value);
  }
  for (let i = 0, oldProp; oldProp = oldProps[i]; i++) {
    if (!newProps[oldProp.name]) {
      $target.removeAttribute(oldProp.name);
    }
  }
}

function changed($node1, $node2) {
  return $node1.nodeType !== $node2.nodeType ||
  $node1.nodeType === 3 && $node1.textContent !== $node2.textContent ||
  $node1.tagName !== $node2.tagName;
}

function updateElement($parent, $newNode, $oldNode, index = 0) {
  if (!$oldNode) {
    $parent.appendChild($newNode);
  } else if (!$newNode) {
    $parent.removeChild($oldNode);
  } else {
    if (changed($newNode, $oldNode)) {
      $parent.replaceChild($newNode, $oldNode);
    } else if ($newNode.nodeType !== 3) {
      updateProps(
        $parent.childNodes[index],
        $newNode.attributes,
        $oldNode.attributes
      );
      updateNodes($parent.childNodes[index], $newNode.childNodes, $oldNode.childNodes);
    }
  }
}

export function updateNodes($parent, newNodes) {
  const oldNodes = [...$parent.childNodes];
  newNodes = [...newNodes];
  for (let i = 0; i < newNodes.length || i < oldNodes.length; i++) {
    updateElement(
      $parent,
      newNodes[i],
      oldNodes[i],
      i
    );
  }
}
