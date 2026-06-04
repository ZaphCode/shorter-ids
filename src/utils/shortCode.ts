import { randomBytes } from "crypto";

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const DEFAULT_LENGTH = 7;

function randomCode(length = DEFAULT_LENGTH): string {
  const bytes = randomBytes(length);
  let code = "";

  for (const byte of bytes) {
    code += ALPHABET[byte % ALPHABET.length];
  }

  return code;
}

export function createUniqueShortCode(): string {
  return randomCode();
}

export async function createShortCodeWithUniquenessCheck(
  exists: (shortCode: string) => Promise<boolean>
): Promise<string> {
  let code = createUniqueShortCode();

  while (await exists(code)) {
    code = createUniqueShortCode();
  }

  return code;
}
