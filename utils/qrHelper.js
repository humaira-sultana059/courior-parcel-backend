import QRCode from "qrcode";

/**
 * Generate QR code for a parcel tracking number
 * @param {string} trackingNumber - The parcel tracking number
 * @returns {Promise<string>} - Base64 encoded QR code image
 */
export const generateQRCode = async (trackingNumber) => {
  try {
    // Generate QR code as data URL (base64 encoded image)
    const qrCodeDataURL = await QRCode.toDataURL(trackingNumber, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 300,
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error("[v0] Error generating QR code:", error.message);
    throw new Error("Failed to generate QR code");
  }
};

/**
 * Verify QR code data matches tracking number
 * @param {string} scannedData - The scanned QR code data
 * @param {string} trackingNumber - The expected tracking number
 * @returns {boolean} - True if match, false otherwise
 */
export const verifyQRCode = (scannedData, trackingNumber) => {
  return scannedData.trim() === trackingNumber.trim();
};
