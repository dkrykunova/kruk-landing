"use client";

import { useEffect, useState } from "react";
import { content, partnerCategories } from "@/content/uk";
import { track } from "@/lib/analytics";
import { useTurnstile } from "@/lib/turnstile-client";
import { captureUtm, readUtm } from "@/lib/utm";

const t = content.partnerForm;
const form = content.form;

type Field = "company" | "website" | "category" | "description" | "audience" | "name" | "role" | "email" | "contact";
const REQUIRED: Field[] = ["company", "category", "description", "name", "email"];

const input =
  "min-h-12 w-full rounded-2xl border border-line bg-white px-4 text-base text-ink placeholder:text-ink-3 focus:border-ink-3 focus:outline-none aria-[invalid]:border-orange-ink";

export function PartnerForm() {
  const [values, setValues] = useState<Record<Field, string>>({
    company: "", website: "", category: "", description: "", audience: "", name: "", role: "", email: "", contact: "",
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const turnstile = useTurnstile();

  useEffect(() => captureUtm(), []);

  const set = (k: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors.has(k)) setErrors((s) => { const n = new Set(s); n.delete(k); return n; });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const fax = (new FormData(e.currentTarget).get("fax") as string) ?? "";
    const missing = new Set<string>(REQUIRED.filter((k) => !values[k].trim()));
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email)) missing.add("email");
    if (!consent) missing.add("consent");
    setErrors(missing);
    if (missing.size) return;

    setState("sending");
    setFormError(null);
    const turnstileToken = await turnstile.getToken();
    if (turnstileToken === null) {
      setFormError(t.errors.generic);
      return setState("idle");
    }
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, consent, fax, turnstileToken, utm: readUtm().utm }),
      });
      const data = (await res.json()) as { status: string; fields?: string[] };
      if (data.status === "ok") {
        track("partner_application", { category: values.category });
        return setState("done");
      }
      if (data.status === "invalid" && data.fields) setErrors(new Set(data.fields));
      setFormError(data.status === "rate_limited" ? t.errors.rateLimited : t.errors.generic);
    } catch {
      setFormError(t.errors.generic);
    }
    setState("idle");
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-3xl border border-line bg-white p-8">
        <p className="text-2xl font-extrabold text-ink">{t.success.title}</p>
        <p className="mt-2 text-ink-2">{t.success.text}</p>
      </div>
    );
  }

  const field = (k: Field, opts: { textarea?: boolean; type?: string; autoComplete?: string } = {}) => {
    const req = REQUIRED.includes(k);
    const id = `pf-${k}`;
    const props = {
      id,
      name: k,
      value: values[k],
      onChange: set(k),
      placeholder: (t.placeholders as Record<string, string>)[k] ?? "",
      "aria-invalid": errors.has(k) || undefined,
      "aria-describedby": errors.has(k) ? `${id}-err` : undefined,
      className: opts.textarea ? `${input} min-h-28 py-3` : input,
    };
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
          {t.fields[k]}
          {req && <span className="text-orange-ink"> *</span>}
        </label>
        {opts.textarea ? (
          <textarea {...props} rows={4} />
        ) : (
          <input {...props} type={opts.type ?? "text"} autoComplete={opts.autoComplete} />
        )}
        {errors.has(k) && (
          <p id={`${id}-err`} className="mt-1 text-sm font-medium text-orange-ink">
            {t.required}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 rounded-3xl border border-line bg-white p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("company", { autoComplete: "organization" })}
        {field("website", { type: "url", autoComplete: "url" })}
      </div>
      <div>
        <label htmlFor="pf-category" className="mb-1.5 block text-sm font-semibold text-ink">
          {t.fields.category}
          <span className="text-orange-ink"> *</span>
        </label>
        <select
          id="pf-category"
          name="category"
          value={values.category}
          onChange={set("category")}
          aria-invalid={errors.has("category") || undefined}
          className={input}
        >
          <option value="" disabled>—</option>
          {partnerCategories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
          <option value="other">{t.fields.categoryOther}</option>
        </select>
        {errors.has("category") && <p className="mt-1 text-sm font-medium text-orange-ink">{t.required}</p>}
      </div>
      {field("description", { textarea: true })}
      {field("audience")}
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", { autoComplete: "name" })}
        {field("role", { autoComplete: "organization-title" })}
        {field("email", { type: "email", autoComplete: "email" })}
        {field("contact", { autoComplete: "tel" })}
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-2">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          aria-invalid={errors.has("consent") || undefined}
          className="mt-0.5 size-5 shrink-0 accent-ink"
        />
        <span>
          {form.consentBefore}
          <a href="/privacy" target="_blank" className="underline underline-offset-2">{form.consentPrivacy}</a>
          {form.consentMiddle}
          <a href="/consent" target="_blank" className="underline underline-offset-2">{form.consentConsent}</a>
        </span>
      </label>
      {errors.has("consent") && <p className="-mt-3 text-sm font-medium text-orange-ink">{form.errors.consentRequired}</p>}

      <div ref={turnstile.box} className="empty:hidden" />
      <div className="hp" aria-hidden="true">
        <label>
          Fax
          <input type="text" name="fax" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {formError && <p role="alert" className="text-sm font-medium text-orange-ink">{formError}</p>}
      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex min-h-12 items-center justify-center rounded-full bg-orange px-7 font-semibold text-ink transition hover:bg-orange-hover disabled:cursor-wait disabled:opacity-70 sm:justify-self-start"
      >
        {state === "sending" ? t.submitting : t.submit}
      </button>
    </form>
  );
}
