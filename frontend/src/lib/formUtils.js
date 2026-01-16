// src/lib/formUtils.js

export function parseCommaList(value) {
    return (value || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  