export function createNode(type: any, props: any, ...children: any[]) {
  if (children.length) props = { ...props, children: children.length === 1 ? children[0] : children };
  return type(props);
}
