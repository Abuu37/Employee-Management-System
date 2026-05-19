export const richTextToPlainText = (value?: string | null): string => {
  if (!value) return "";

  if (typeof document === "undefined") {
    return value
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const container = document.createElement("div");
  container.innerHTML = value;
  return (container.textContent ?? "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const isRichTextEmpty = (value?: string | null): boolean =>
  richTextToPlainText(value).length === 0;
