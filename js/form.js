/**
 * ============================================================
 * HAKI TOOLS — Form Handler
 * Provider-agnostic. Reads endpoint from SITE_CONFIG.
 * ============================================================
 */

(function() {
  'use strict';

  function getConfig() {
    return (window.SITE_CONFIG && window.SITE_CONFIG.form) || {
      provider: 'formspree',
      formEndpoint: 'YOUR_FORMSPREE_ENDPOINT_HERE',
      notificationEmail: 'robbie.robinson@akoben.ai',
    };
  }

  // ── Validation helpers ──────────────────────────────────────
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function clearErrors(form) {
    form.querySelectorAll('.form-field-error.visible').forEach(el => el.classList.remove('visible'));
    form.querySelectorAll('.form-input.error, .form-textarea.error, .form-select.error').forEach(el => el.classList.remove('error'));
  }

  function showFieldError(fieldEl, errorEl, message) {
    if (fieldEl) fieldEl.classList.add('error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function validateForm(form) {
    let valid = true;
    clearErrors(form);

    // Name
    const nameInput = form.querySelector('#field-name');
    const nameError = form.querySelector('#error-name');
    if (nameInput && nameInput.value.trim().length < 2) {
      showFieldError(nameInput, nameError, 'Please enter your name.');
      valid = false;
    }

    // Email
    const emailInput = form.querySelector('#field-email');
    const emailError = form.querySelector('#error-email');
    if (emailInput) {
      if (!emailInput.value.trim()) {
        showFieldError(emailInput, emailError, 'Please enter your email address.');
        valid = false;
      } else if (!isValidEmail(emailInput.value)) {
        showFieldError(emailInput, emailError, 'Please enter a valid email address.');
        valid = false;
      }
    }

    // Business name
    const businessInput = form.querySelector('#field-business');
    const businessError = form.querySelector('#error-business');
    if (businessInput && businessInput.value.trim().length < 1) {
      showFieldError(businessInput, businessError, 'Please enter your business name.');
      valid = false;
    }

    // Description
    const descInput = form.querySelector('#field-description');
    const descError = form.querySelector('#error-description');
    if (descInput && descInput.value.trim().length < 10) {
      showFieldError(descInput, descError, 'Please describe what you\'re building (at least 10 characters).');
      valid = false;
    }

    return valid;
  }

  // ── Build FormData from config ──────────────────────────────
  function buildFormData(form) {
    const data = new FormData(form);

    // Add hidden Formspree fields
    const config = getConfig();
    if (config.provider === 'formspree') {
      // Formspree uses _replyto for reply-to email
      const emailVal = form.querySelector('#field-email');
      if (emailVal) data.set('_replyto', emailVal.value);
      // Subject line
      const nameVal = form.querySelector('#field-name');
      const businessVal = form.querySelector('#field-business');
      if (nameVal && businessVal) {
        data.set('_subject', `New inquiry from ${nameVal.value} — ${businessVal.value}`);
      }
      // Disable Formspree redirect
      data.set('_next', window.location.href);
    }

    return data;
  }

  // ── Submit handler ──────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const config = getConfig();
    const endpoint = config.formEndpoint;

    // Validate
    if (!validateForm(form)) {
      // Focus first errored field
      const firstError = form.querySelector('.form-input.error, .form-textarea.error, .form-select.error');
      if (firstError) firstError.focus();
      return;
    }

    // Check for placeholder endpoint
    if (!endpoint || endpoint === 'YOUR_FORMSPREE_ENDPOINT_HERE' || endpoint.includes('YOUR_')) {
      // Dev mode: show success anyway so you can test the UI
      console.warn('[Haki Tools] Form endpoint not configured. See config/site.js. Showing success state for preview.');
      showSuccess(form);
      return;
    }

    // Loading state
    const submitBtn = form.querySelector('.form-submit');
    const globalError = form.querySelector('.form-error-global');
    if (submitBtn) submitBtn.classList.add('loading');
    if (globalError) globalError.classList.remove('visible');

    try {
      const formData = buildFormData(form);
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        showSuccess(form);
      } else {
        const data = await response.json().catch(() => ({}));
        const message = (data.errors && data.errors[0] && data.errors[0].message)
          ? data.errors[0].message
          : 'Something went wrong. Please try again or email us directly.';
        showError(form, message);
      }
    } catch (err) {
      console.error('[Haki Tools] Form submission error:', err);
      showError(form, 'Network error — please check your connection and try again.');
    } finally {
      if (submitBtn) submitBtn.classList.remove('loading');
    }
  }

  function showSuccess(form) {
    const formBody = form.querySelector('.form-body');
    const formFooter = form.querySelector('.form-footer');
    const successMsg = document.querySelector('.form-success');

    if (formBody) formBody.style.display = 'none';
    if (formFooter) formFooter.style.display = 'none';
    if (successMsg) {
      successMsg.classList.add('visible');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function showError(form, message) {
    const globalError = form.querySelector('.form-error-global');
    if (globalError) {
      globalError.textContent = message;
      globalError.classList.add('visible');
      globalError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // ── Init ────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);

    // Inline validation on blur
    form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
      input.addEventListener('blur', () => {
        if (input.classList.contains('error')) {
          // Re-validate just this field
          if (input.value.trim().length > 0) {
            input.classList.remove('error');
            const errorEl = document.querySelector(`#error-${input.id.replace('field-', '')}`);
            if (errorEl) errorEl.classList.remove('visible');
          }
        }
      });
    });
  });

})();
