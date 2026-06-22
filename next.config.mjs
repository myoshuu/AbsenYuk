/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdfmake", "exceljs", "qrcode"],
  allowedDevOrigins: [""],
};

export default nextConfig;
