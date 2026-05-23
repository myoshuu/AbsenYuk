class Node {
  constructor(nodeType, nodeName) {
    this.nodeType = nodeType;
    this.nodeName = nodeName;
    this.childNodes = [];
    this.attributes = {};
    this.parentNode = null;
  }

  appendChild(node) {
    if (!node) return null;
    this.childNodes.push(node);
    node.parentNode = this;
    return node;
  }

  removeChild(node) {
    const index = this.childNodes.indexOf(node);
    if (index >= 0) {
      this.childNodes.splice(index, 1);
      node.parentNode = null;
    }
    return node;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  setAttributeNS(_ns, name, value) {
    this.setAttribute(name, value);
  }

  getAttribute(name) {
    return this.attributes[name];
  }
}

class TextNode extends Node {
  constructor(text) {
    super(3, '#text');
    this.nodeValue = text;
    this.textContent = text;
  }
}

class ElementNode extends Node {
  constructor(tagName, nodeName) {
    super(1, nodeName);
    this.tagName = tagName;
    this.style = {};
    this.innerHTML = '';
  }
}

class CanvasContext {
  constructor() {
    this.font = '10px sans-serif';
  }

  measureText(text) {
    const value = text == null ? '' : String(text);
    return { width: value.length * 6 };
  }

  drawImage() { }
}

class CanvasElement extends ElementNode {
  constructor(tagName) {
    super(tagName, tagName.toUpperCase());
    this.width = 0;
    this.height = 0;
  }

  getContext() {
    return new CanvasContext();
  }

  toDataURL() {
    return '';
  }
}

class DocumentFragment extends ElementNode {
  constructor() {
    super('#document-fragment', '#document-fragment');
    this.nodeType = 11;
  }
}

class Document {
  createElement(tagName) {
    const lower = String(tagName).toLowerCase();
    if (lower === 'canvas') {
      return new CanvasElement(tagName);
    }
    const nodeName = String(tagName).toUpperCase();
    return new ElementNode(tagName, nodeName);
  }

  createElementNS(_ns, tagName) {
    return new ElementNode(tagName, tagName);
  }

  createTextNode(text) {
    return new TextNode(text);
  }

  createDocumentFragment() {
    return new DocumentFragment();
  }

  getElementById() {
    return null;
  }
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function serializeNode(node) {
  if (!node) return '';

  if (node.nodeType === 3) {
    return escapeText(node.nodeValue);
  }

  if (node.nodeType === 11) {
    return node.childNodes.map(serializeNode).join('');
  }

  const attrs = Object.keys(node.attributes || {})
    .map((name) => ` ${name}="${escapeAttribute(node.attributes[name])}"`)
    .join('');
  const children = (node.childNodes || []).map(serializeNode).join('');

  return `<${node.nodeName}${attrs}>${children}</${node.nodeName}>`;
}

class XMLSerializer {
  serializeToString(node) {
    return serializeNode(node);
  }
}

function createDocument() {
  return new Document();
}

module.exports = {
  createDocument,
  XMLSerializer
};
