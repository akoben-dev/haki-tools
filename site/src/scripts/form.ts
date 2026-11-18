// Contact form, progressive enhancement.
// Without JS: a normal POST to PUBLIC_FORM_ENDPOINT; the backend (infra/lambda/contact) answers with a
// 303 redirect to /contact/thanks/ or /contact/error/.
// With JS: validate inline, POST JSON, and show the success state in place.
const form = document.querySelector<HTMLFormElement>('[data-contact-form]');

if (form) {
  const started = form.querySelector<HTMLInputElement>('input[name="started_at"]');
  if (started) started.value = String(Date.now());

  // Anti-bot: a signed timestamp from the backend, fetched once the visitor starts
  // typing. The backend drops messages sent within seconds of it. If the fetch
  // fails the form still sends; the token is a filter, not a gate.
  const tokenInput = form.querySelector<HTMLInputElement>('input[name="token"]');
  const tokenUrl = form.action.replace(/\/?$/, '/token');
  let tokenRequested = false;
  form.addEventListener('focusin', () => {
    if (tokenRequested || !tokenInput) return;
    tokenRequested = true;
    fetch(tokenUrl, { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.token) tokenInput.value = j.token;
      })
      .catch(() => {});
  });
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const success = document.querySelector<HTMLElement>('[data-form-success]');

  const fieldError = (name: string, message: string) => {
    const input = form.elements.namedItem(name) as HTMLInputElement | null;
    const err = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) err.textContent = message;
  };

  const validate = () => {
    const data = new FormData(form);
    const errors: Record<string, string> = {};
    const val = (k: string) => String(data.get(k) ?? '').trim();
    if (!val('name')) errors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val('email'))) errors.email = 'Please enter a valid email address.';
    if (!val('business_name')) errors.business_name = 'Please enter your business name.';
    if (val('description').length < 10) errors.description = 'A sentence or two about the project helps.';
    for (const k of ['name', 'email', 'business_name', 'description']) fieldError(k, errors[k] ?? '');
    return errors;
  };

  form.setAttribute('novalidate', '');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errors = validate();
    const first = Object.keys(errors)[0];
    if (first) {
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      status.textContent = 'Please fix the highlighted fields.';
      return;
    }
    button.disabled = true;
    button.dataset.loading = 'true';
    status.textContent = 'Sending…';
    try {
      const body = Object.fromEntries(new FormData(form).entries());
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        if (json.errors) for (const [k, m] of Object.entries(json.errors)) fieldError(k, String(m));
        throw new Error('send failed');
      }
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus();
      }
    } catch {
      status.innerHTML = '';
      status.append(
        'Something went wrong sending your message. Please try again, or email ',
        Object.assign(document.createElement('a'), {
          href: 'mailto:' + form.dataset.fallbackEmail,
          textContent: form.dataset.fallbackEmail,
        }),
        '.',
      );
    } finally {
      button.disabled = false;
      delete button.dataset.loading;
    }
  });
}
