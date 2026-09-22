// FAQ answers only ever need plain text plus, occasionally, a single
// [label](url) link (e.g. "email carla@...") — full markdown would be
// overkill for that, so this just escapes HTML and linkifies that one pattern.
export function renderLiteHtml(text: string): string {
  const escaped = text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
  return escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => `<a href="${url}">${label}</a>`);
}
