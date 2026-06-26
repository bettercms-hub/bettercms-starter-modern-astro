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
    if (btn) btn.disabled = true;
    try {
      const res = await fetch(`${api}/api/v1/forms/public/${id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      if (!res.ok) {
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
      if (general) general.hidden = false;
      if (btn) btn.disabled = false;
    }
  });
}

document.addEventListener("astro:page-load", () =>
  document.querySelectorAll<HTMLFormElement>("[data-bcms-form]").forEach(wire),
);
