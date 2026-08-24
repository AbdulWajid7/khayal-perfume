export function formatPrice(amount: number, currencyCode: string = "PKR"): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-oud-gold underline">$1</a>');
}

/**
 * Minimal markdown-to-HTML converter for editorial blog content.
 * Supports headings, paragraphs, bold text, links, and horizontal rules.
 */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let paragraphBuffer: string[] = [];

  function flushParagraph() {
    if (paragraphBuffer.length) {
      html.push(`<p>${renderInline(paragraphBuffer.join(" "))}</p>`);
      paragraphBuffer = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }
    if (trimmed === "---") {
      flushParagraph();
      html.push("<hr />");
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushParagraph();
      html.push(`<h3>${renderInline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      html.push(`<h2>${renderInline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushParagraph();
      html.push(`<h1>${renderInline(trimmed.slice(2))}</h1>`);
      continue;
    }

    paragraphBuffer.push(trimmed);
  }
  flushParagraph();

  return html.join("\n");
}
