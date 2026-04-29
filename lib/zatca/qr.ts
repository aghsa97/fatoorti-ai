import QRCode from "qrcode";

interface ZatcaQRData {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalWithVat: number;
  vatTotal: number;
}

function encodeUTF8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function encodeTLV(tag: number, value: string): Uint8Array {
  const valueBytes = encodeUTF8(value);
  const tlv = new Uint8Array(2 + valueBytes.length);
  tlv[0] = tag;
  tlv[1] = valueBytes.length;
  tlv.set(valueBytes, 2);
  return tlv;
}

function concatArrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function generateZatcaTLV(data: ZatcaQRData): string {
  const tlvBuffers = [
    encodeTLV(1, data.sellerName),
    encodeTLV(2, data.vatNumber),
    encodeTLV(3, data.timestamp),
    encodeTLV(4, data.totalWithVat.toFixed(2)),
    encodeTLV(5, data.vatTotal.toFixed(2)),
  ];

  const combined = concatArrays(tlvBuffers);
  return uint8ToBase64(combined);
}

export async function generateZatcaQRDataURL(data: ZatcaQRData): Promise<string> {
  const base64TLV = generateZatcaTLV(data);
  return QRCode.toDataURL(base64TLV, {
    width: 200,
    margin: 1,
    color: {
      dark: "#0A0A0A",
      light: "#FFFFFF",
    },
  });
}
