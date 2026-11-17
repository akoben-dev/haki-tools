// Prepare a raw brand SVG for inline use: drop the XML prolog and ids
// (so several copies can share a page) and label it for screen readers.
export function inlineSvg(raw: string, label: string) {
  return raw
    .replace(/<\?xml[^>]*\?>/, '')
    .replace(/\s(id|data-name)="[^"]*"/g, '')
    .replace('<svg', `<svg role="img" aria-label="${label}"`)
    .trim();
}
