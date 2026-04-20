import { randomBytes } from "crypto";
import { urlsByCode } from "../store";

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
  let code = randomCode();

  while (urlsByCode.has(code)) {
    code = randomCode();
  }

  return code;
}
