export function parseBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "1", "yes"].includes(value.toLowerCase());
  return false;
}

export function toObjectIdString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
