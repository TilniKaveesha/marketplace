import crypto from 'crypto';

export const PAYWAY_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://payway.com.kh/api/gateway/v2'
    : 'https://sandbox.payway.com.kh/api/gateway/v2',
  merchantId: validateEnvVar('PAYWAY_MERCHANT_ID'),
  apiKey: validateEnvVar('PAYWAY_API_URL'), // Changed from API_URL to API_KEY
  publicKey: validateEnvVar('PAYWAY_PUBLIC_KEY'),
  privateKey: validateEnvVar('PAYWAY_PRIVATE_KEY'),
};

function validateEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const formatKey = (key: string) => {
  if (key.includes('-----BEGIN')) return key;
  // Handle both escaped newlines and actual newlines
  return key.replace(/\\n/g, '\n').replace(/\n/g, '\n');
};

export const encryptData = (data: string): string => {
  try {
    const publicKey = formatKey(PAYWAY_CONFIG.publicKey);
    return crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(data, 'utf8')
    ).toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const decryptData = (encryptedData: string): string => {
  try {
    const privateKey = formatKey(PAYWAY_CONFIG.privateKey);
    return crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(encryptedData, 'base64')
    ).toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const signPayload = (payloadStr: string): string => {
  try {
    const privateKey = formatKey(PAYWAY_CONFIG.privateKey); // Use the same private key
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(payloadStr);
    signer.end();
    return signer.sign(privateKey, "base64");
  } catch (error) {
    throw new Error(`Signing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};