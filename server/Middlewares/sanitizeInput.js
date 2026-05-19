const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return value.replace(/\u0000/g, "").trim();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    const output = {};
    for (const [key, nested] of Object.entries(value)) {
      output[key] = sanitizeValue(nested);
    }
    return output;
  }

  return value;
};

const sanitizeObjectInPlace = (source) => {
  if (!source || typeof source !== "object") return;

  for (const [key, nested] of Object.entries(source)) {
    source[key] = sanitizeValue(nested);
  }
};

export const sanitizeInput = (req, _res, next) => {
  sanitizeObjectInPlace(req.body);
  sanitizeObjectInPlace(req.query);
  sanitizeObjectInPlace(req.params);
  next();
};
