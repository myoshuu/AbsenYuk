const { createDocument, XMLSerializer } = require('./qr_dom');

let qrCodeModule = null;

const loadQrCodeModule = () => {
  if (qrCodeModule) return qrCodeModule;

  if (typeof global.CanvasRenderingContext2D === 'undefined') {
    global.CanvasRenderingContext2D = function CanvasRenderingContext2D() { };
  }
  if (typeof global.Image === 'undefined') {
    global.Image = function Image() { };
  }
  if (typeof global.C2S === 'undefined') {
    global.C2S = require('easyqrcodejs/src/canvas2svg');
  }

  qrCodeModule = require('easyqrcodejs');
  return qrCodeModule;
};

const generateQrSvg = (text, size = 240) => {
  const document = createDocument();
  const prevDocument = global.document;
  const prevXMLSerializer = global.XMLSerializer;
  let svgText = null;

  global.document = document;
  global.XMLSerializer = XMLSerializer;
  const QRCode = loadQrCodeModule();

  try {
    const container = document.createElement('div');
    new QRCode(container, {
      text,
      width: size,
      height: size,
      drawer: 'svg',
      correctLevel: QRCode.CorrectLevel.H,
      onRenderingEnd: (_options, dataURL) => {
        svgText = dataURL || container.innerHTML || null;
      }
    });
    if (!svgText) {
      svgText = container.innerHTML || null;
    }
  } finally {
    global.document = prevDocument;
    global.XMLSerializer = prevXMLSerializer;
  }

  return svgText;
};

module.exports = {
  generateQrSvg
};
