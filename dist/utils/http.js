"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBoolean = parseBoolean;
exports.toObjectIdString = toObjectIdString;
exports.normalizeEmail = normalizeEmail;
exports.normalizeText = normalizeText;
function parseBoolean(value) {
    if (typeof value === "boolean")
        return value;
    if (typeof value === "string")
        return ["true", "1", "yes"].includes(value.toLowerCase());
    return false;
}
function toObjectIdString(value) {
    return typeof value === "string" ? value.trim() : "";
}
function normalizeEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}
