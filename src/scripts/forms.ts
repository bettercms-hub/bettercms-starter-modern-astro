/** Wire every [data-bcms-form] to the public submissions endpoint. Re-runs after view transitions. */
function wire(form: HTMLFormElement) {
  if (form.dataset.wired) return;
  form.dataset.wired = "1";
  const api = form.dataset.api || "https://api.bettercms.ai";
  const id = form.dataset.formId!;
  const success = form.querySelector<HTMLElement>("[data-form-success]");
  const general = form.querySelector<HTMLElement>("[data-form-general]");
  const btn = form.querySelector<HTMLButtonElement>("button[type=submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (general) general.hidden = true;
    form.querySelectorAll<HTMLElement>("[data-error]").forEach((el) => (el.textContent = ""));
    const data: Record<string, string> = {};
    new FormData(form).forEach((v, k) => { data[k] = String(v); });
    // Turnstile injects a hidden `cf-turnstile-response` input into the form, so it
    // arrives as an ordinary field. The API expects it as a SIBLING of `data`, not
    // inside it, so lift it out — left in `data` it would be validated as an unknown
    // form field AND the CAPTCHA check would see no token at all.
    const turnstileToken = data["cf-turnstile-response"];
    delete data["cf-turnstile-response"];
    if (btn) btn.disabled = true;
    try {
      const res = await fetch(`${api}/api/v1/forms/public/${id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          turnstileToken ? { data, "cf-turnstile-response": turnstileToken } : { data },
        ),
      });
      if (!res.ok) {
        // Turnstile tokens are SINGLE-USE. Without this reset, a recoverable error
        // (a missing required field) leaves a spent token in the form and the user's
        // corrected resubmit fails the CAPTCHA instead — an unfixable-looking form.
        window.turnstile?.reset();
        const body = (await res.json().catch(() => ({}))) as { errors?: Record<string, string> };
        if (body.errors) {
          for (const [k, msg] of Object.entries(body.errors)) {
            const el = form.querySelector<HTMLElement>(`[data-error="${k}"]`);
            if (el) el.textContent = msg;
          }
        } else if (general) general.hidden = false;
        if (btn) btn.disabled = false;
        return;
      }
      form.querySelectorAll<HTMLElement>("input, textarea, select, button, .field-error").forEach((el) => (el.hidden = true));
      if (success) success.hidden = false;
    } catch {
      window.turnstile?.reset();
      if (general) general.hidden = false;
      if (btn) btn.disabled = false;
    }
  });
}

document.addEventListener("astro:page-load", () =>
  document.querySelectorAll<HTMLFormElement>("[data-bcms-form]").forEach(wire),
);
