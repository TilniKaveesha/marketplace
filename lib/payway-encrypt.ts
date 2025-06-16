// lib/payway-encrypt.ts
import crypto from 'crypto';

export const encryptData = (data: string): string => {
  return crypto.publicEncrypt(
    {
      key: process.env.PAYWAY_PUBLIC_KEY!,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data)
  ).toString('base64');
};

export const decryptData = (encryptedData: string): string => {
  return crypto.privateDecrypt(
    {
      key: process.env.PAYWAY_PRIVATE_KEY!,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(encryptedData, 'base64')
  ).toString('utf8');
};