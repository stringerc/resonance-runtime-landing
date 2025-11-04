import bcrypt from "bcryptjs";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";



// Configure zxcvbn globally
zxcvbnOptions.setOptions({
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
});

/**
 * Hash password using bcrypt (OWASP recommended: 12+ rounds)
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // OWASP minimum recommendation
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength using zxcvbn
 * Returns validation result with score (0-4) and feedback
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
} {
  const result = zxcvbn(password);
  
  // Require minimum score of 3 (strong) or 4 (very strong)
  // NIST 800-63B: Strong passwords without forced rotation
  const valid = result.score >= 3;
  
  return {
    valid,
    score: result.score,
    feedback: result.feedback.suggestions || [],
  };
}

/**
 * Password requirements (NIST 800-63B compliant)
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 12, // NIST: 8 minimum, we use 12 for extra security
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  // DO NOT require periodic password changes (NIST recommendation)
  // DO NOT allow common passwords (checked via zxcvbn)
} as const;

