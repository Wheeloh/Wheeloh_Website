// Build-time QR code for the homepage download card (no client-side library).
import QRCode from "qrcode";

export async function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#0b0b0d", light: "#00000000" },
  });
}
