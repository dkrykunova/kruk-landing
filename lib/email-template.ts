// HTML-шаблон листів Крука (вітальний і розсилки). Без залежностей — використовується і зі скриптів.

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

export type EmailParts = {
  title: string;
  preheader: string;
  /** Абзаци через порожній рядок; рядок, що складається лише з {{ … }}, стає виділеним кодом. */
  body: string;
  cta?: { text: string; url: string };
  footerHtml: string;
};

function paragraphs(body: string): string {
  return body
    .trim()
    .split(/\n\s*\n/)
    .map((p) => {
      const t = p.trim();
      if (/^\{\{[^}]+\}\}$/.test(t)) {
        return `<p style="margin:20px 0;text-align:center"><span style="display:inline-block;font-family:'Courier New',monospace;font-size:26px;font-weight:700;letter-spacing:2px;background:#fffdb4;border:2px dashed #23003f;border-radius:14px;padding:14px 22px">${t}</span></p>`;
      }
      return `<p style="margin:0 0 16px">${esc(t).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

export function renderEmail({ title, preheader, body, cta, footerHtml }: EmailParts): string {
  const button = cta
    ? `<p style="margin:24px 0 8px"><a href="${cta.url}" style="display:inline-block;background:#f94500;color:#23003f;font-weight:700;text-decoration:none;padding:14px 26px;border-radius:999px">${esc(cta.text)}</a></p>`
    : "";
  return `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:#fffdf0;font-family:Arial,Helvetica,sans-serif;color:#23003f">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e3dceb;border-radius:24px">
<tr><td style="padding:32px 32px 8px;font-size:28px;font-weight:800;letter-spacing:-0.5px">крук<span style="color:#f94500">.</span></td></tr>
<tr><td style="padding:8px 32px 32px;font-size:16px;line-height:1.55">
<h1 style="margin:8px 0 16px;font-size:28px;line-height:1.2">${esc(title)}</h1>
${paragraphs(body)}${button}
</td></tr></table>
<p style="max-width:560px;margin:20px auto 0;font-size:12px;line-height:1.5;color:#5e4a78">${footerHtml}</p>
</td></tr></table></body></html>`;
}
