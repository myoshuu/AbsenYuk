const QRCode = require('qrcode');

const generateQrSvg = async (text, size = 240) => {
  try {
    const svg = await QRCode.toString(text, {
      type: 'svg',
      width: size,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'H'
    });
    return svg;
  } catch (error) {
    console.error('QR generation error:', error);
    return null;
  }
};

module.exports = { generateQrSvg };
