function stripTrailingComma(value) {
  return value.endsWith(",") ? value.slice(0, -1).trim() : value;
}

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

export function normalizeFirebaseEnvValue(rawValue = "") {
  if (!rawValue) return "";

  let value = String(rawValue).trim();
  value = stripTrailingComma(value);
  value = stripWrappingQuotes(value).trim();
  value = stripTrailingComma(value);

  return value.trim();
}

export function normalizeFirebasePrivateKey(rawValue = "") {
  const normalized = normalizeFirebaseEnvValue(rawValue);
  if (!normalized) return "";

  return normalized.replace(/\\n/g, "\n").replace(/\r\n/g, "\n").trim();
}
