export function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  return isValidEmail ? normalizedEmail : null;
}

export function readRequiredString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function normalizeUrl(url: unknown): string | null {
  const value = readRequiredString(url);

  if (!value) {
    return null;
  }

  try {
    const parsedUrl = new URL(value);
    const isHttpUrl = parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";

    return isHttpUrl ? parsedUrl.toString() : null;
  } catch {
    return null;
  }
}
