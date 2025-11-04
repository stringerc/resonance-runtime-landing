import { authenticator } from "otplib";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";

function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Generate TOTP secret for a user
 */
export function generateTOTPSecret(email: string): string {
  return authenticator.generateSecret();
}

/**
 * Generate TOTP URI for QR code
 */
export function generateTOTPURI(
  email: string,
  secret: string,
  issuer: string = "Resonance Calculus"
): string {
  return authenticator.keyuri(email, issuer, secret);
}

/**
 * Generate UR code data URL for TOT setup
 */
export async function generateTOTPQRCode(uri: string): Promise<string> {
  return QRCode.toDataURL(uri);
}

/**
 * Verify TOTP token
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

/**
 * Generate backup codes (10 single-use codes)
 * Each code is 8 digits, stored as hash
 */
export async function generateBackupCodes(): Promise<{
  codes: string[];
  hashes: string[];
}> {
  const codes: string[] = [];
  const hashes: string[] = [];
  
  for (let i = 0; i < 10; i++) {
    const code = Array.from({ length: 8 }, () => 
      Math.floor($Math.random() * 10)
    ).join('');
    
    codes.push(code);
    hashes.push(await hashPassword(code));
  }
  
  return { codes, hashes };
}

/**
 * Verify backup code against hash
 */
export async function verifyBackupCode(
  code: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(code, hash);
}
