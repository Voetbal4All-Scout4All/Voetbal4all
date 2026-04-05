(function () {
  if (window.V4AFeedback) return;

  const STYLE_ID = "v4a-feedback-style";
  const ROOT_ID = "v4a-feedback-root";
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let activeModal = null;

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderText(value) {
    return escapeHtml(value).replace(/\n/g, "<br>");
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}{position:fixed;inset:0;z-index:1200;pointer-events:none}
      #${ROOT_ID} .v4a-toast-stack{position:fixed;top:88px;right:16px;display:grid;gap:10px;width:min(360px,calc(100vw - 24px));pointer-events:none}
      #${ROOT_ID} .v4a-toast{pointer-events:auto;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:start;padding:14px 16px;border-radius:18px;color:#f4f6fc;background:linear-gradient(180deg,rgba(11,16,34,.92),rgba(5,8,20,.96));border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(18px);box-shadow:0 22px 55px rgba(0,0,0,.45);opacity:0;transform:translateY(-6px) scale(.985);transition:opacity .18s ease,transform .18s ease}
      #${ROOT_ID} .v4a-toast.is-visible{opacity:1;transform:translateY(0) scale(1)}
      #${ROOT_ID} .v4a-toast[data-tone="success"]{border-color:rgba(34,197,94,.45);box-shadow:0 22px 55px rgba(0,0,0,.45),0 0 0 1px rgba(34,197,94,.08)}
      #${ROOT_ID} .v4a-toast[data-tone="warning"]{border-color:rgba(251,191,36,.42)}
      #${ROOT_ID} .v4a-toast[data-tone="danger"]{border-color:rgba(255,51,102,.46)}
      #${ROOT_ID} .v4a-toast-title{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(244,246,252,.7);margin:0 0 4px}
      #${ROOT_ID} .v4a-toast-message{font-size:14px;line-height:1.45}
      #${ROOT_ID} .v4a-toast-close{appearance:none;border:0;background:transparent;color:rgba(244,246,252,.72);font:inherit;font-size:18px;line-height:1;cursor:pointer;padding:2px 0 0}
      #${ROOT_ID} .v4a-toast-close:hover{color:#fff}
      #${ROOT_ID} .v4a-modal-overlay{position:fixed;inset:0;padding:18px;display:flex;align-items:center;justify-content:center;background:rgba(2,6,18,.7);backdrop-filter:blur(10px);pointer-events:auto;opacity:0;transition:opacity .18s ease}
      #${ROOT_ID} .v4a-modal-overlay.is-visible{opacity:1}
      #${ROOT_ID} .v4a-modal{width:min(460px,calc(100vw - 32px));padding:22px;border-radius:24px;background:linear-gradient(180deg,rgba(11,16,34,.96),rgba(5,8,20,.98));border:1px solid rgba(255,255,255,.14);box-shadow:0 28px 70px rgba(0,0,0,.52)}
      #${ROOT_ID} .v4a-modal[data-tone="success"]{border-color:rgba(34,197,94,.42)}
      #${ROOT_ID} .v4a-modal[data-tone="warning"]{border-color:rgba(251,191,36,.4)}
      #${ROOT_ID} .v4a-modal[data-tone="danger"]{border-color:rgba(255,51,102,.46)}
      #${ROOT_ID} .v4a-modal-kicker{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(154,163,193,.82);margin:0 0 8px}
      #${ROOT_ID} .v4a-modal-title{margin:0;font-size:24px;line-height:1.15;color:#f4f6fc}
      #${ROOT_ID} .v4a-modal-message{margin:12px 0 0;font-size:14px;line-height:1.55;color:rgba(244,246,252,.88)}
      #${ROOT_ID} .v4a-modal-description{margin:14px 0 0;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);font-size:13px;line-height:1.5;color:rgba(244,246,252,.76)}
      #${ROOT_ID} .v4a-modal-label{display:block;margin:16px 0 8px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(244,246,252,.72)}
      #${ROOT_ID} .v4a-modal-input{width:100%;padding:13px 14px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:#f4f6fc;font:inherit;outline:none;box-shadow:none}
      #${ROOT_ID} .v4a-modal-input:focus{border-color:rgba(24,160,251,.58);box-shadow:0 0 0 3px rgba(24,160,251,.12)}
      #${ROOT_ID} .v4a-modal-input[readonly]{cursor:text}
      #${ROOT_ID} .v4a-modal-error{min-height:20px;margin-top:8px;font-size:13px;color:#ff8ba7}
      #${ROOT_ID} .v4a-modal-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:18px}
      #${ROOT_ID} .v4a-btn{appearance:none;border-radius:999px;padding:10px 16px;font:inherit;font-weight:700;cursor:pointer;transition:transform .14s ease,filter .14s ease,background .14s ease,border-color .14s ease}
      #${ROOT_ID} .v4a-btn:hover{transform:translateY(-1px);filter:brightness(1.04)}
      #${ROOT_ID} .v4a-btn:active{transform:translateY(0)}
      #${ROOT_ID} .v4a-btn--ghost{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#f4f6fc}
      #${ROOT_ID} .v4a-btn--primary{border:1px solid rgba(255,255,255,.14);background:linear-gradient(135deg,rgba(24,160,251,.92),rgba(34,197,94,.82));color:#04101c}
      body.v4a-feedback-lock{overflow:hidden}
      @media (max-width:640px){
        #${ROOT_ID} .v4a-toast-stack{top:76px;left:12px;right:12px;width:auto}
        #${ROOT_ID} .v4a-modal{padding:20px;border-radius:20px}
        #${ROOT_ID} .v4a-modal-title{font-size:21px}
        #${ROOT_ID} .v4a-modal-actions{flex-direction:column-reverse}
        #${ROOT_ID} .v4a-btn{width:100%}
      }
      @media (prefers-reduced-motion:reduce){
        #${ROOT_ID} .v4a-toast,
        #${ROOT_ID} .v4a-modal-overlay,
        #${ROOT_ID} .v4a-btn{transition:none}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    ensureStyle();
    let root = document.getElementById(ROOT_ID);
    if (root) return root;

    root = document.createElement("div");
    root.id = ROOT_ID;
    root.innerHTML = '<div class="v4a-toast-stack" aria-live="polite" aria-atomic="true"></div>';
    document.body.appendChild(root);
    return root;
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.remove("is-visible");
    window.setTimeout(function () {
      toast.remove();
    }, 180);
  }

  function toast(message, options) {
    const opts = options || {};
    const tone = opts.tone || "info";
    const title = opts.title || "";
    const duration = Number.isFinite(opts.duration) ? opts.duration : 3200;
    const root = ensureRoot();
    const stack = root.querySelector(".v4a-toast-stack");
    const toastEl = document.createElement("div");
    toastEl.className = "v4a-toast";
    toastEl.dataset.tone = tone;
    toastEl.innerHTML = `
      <div>
        ${title ? `<div class="v4a-toast-title">${renderText(title)}</div>` : ""}
        <div class="v4a-toast-message">${renderText(message)}</div>
      </div>
      <button type="button" class="v4a-toast-close" aria-label="Melding sluiten">×</button>
    `;

    const closeBtn = toastEl.querySelector(".v4a-toast-close");
    let closeTimer = 0;
    const close = function () {
      if (closeTimer) window.clearTimeout(closeTimer);
      removeToast(toastEl);
    };

    closeBtn?.addEventListener("click", close);
    stack?.appendChild(toastEl);
    window.requestAnimationFrame(function () {
      toastEl.classList.add("is-visible");
    });

    closeTimer = window.setTimeout(close, duration);
    return close;
  }

  function closeActiveModal(result) {
    if (!activeModal) return;

    const state = activeModal;
    activeModal = null;
    document.removeEventListener("keydown", state.onKeyDown, true);
    document.body.classList.remove("v4a-feedback-lock");
    state.overlay.classList.remove("is-visible");

    window.setTimeout(function () {
      state.overlay.remove();
      if (state.previousFocus && typeof state.previousFocus.focus === "function") {
        state.previousFocus.focus({ preventScroll: true });
      }
      state.resolve(result);
    }, 180);
  }

  function openModal(options) {
    const opts = options || {};
    return new Promise(function (resolve) {
      closeActiveModal({ confirmed: false, value: null });

      const root = ensureRoot();
      const overlay = document.createElement("div");
      const hasInput = !!opts.input;
      const hasCancel = opts.cancelText !== "";
      const description = opts.description ? `<div class="v4a-modal-description">${renderText(opts.description)}</div>` : "";
      const label = hasInput && opts.label ? `<label class="v4a-modal-label" for="v4a-modal-input">${renderText(opts.label)}</label>` : "";
      const inputType = opts.inputType || "text";
      const placeholder = escapeHtml(opts.placeholder || "");
      const value = escapeHtml(opts.value || "");
      const readOnly = opts.readOnly ? " readonly" : "";
      const inputHtml = hasInput ? `
        ${label}
        <input
          id="v4a-modal-input"
          class="v4a-modal-input"
          type="${escapeHtml(inputType)}"
          value="${value}"
          placeholder="${placeholder}"
          autocomplete="${inputType === "email" ? "email" : "off"}"${readOnly}
        />
        <div class="v4a-modal-error" aria-live="polite"></div>
      ` : "";

      overlay.className = "v4a-modal-overlay";
      overlay.innerHTML = `
        <div class="v4a-modal" role="dialog" aria-modal="true" aria-labelledby="v4a-modal-title" data-tone="${escapeHtml(opts.tone || "info")}">
          <div class="v4a-modal-kicker">${renderText(opts.kicker || "Voetbal4All")}</div>
          <h2 id="v4a-modal-title" class="v4a-modal-title">${renderText(opts.title || "Bevestiging")}</h2>
          ${opts.message ? `<p class="v4a-modal-message">${renderText(opts.message)}</p>` : ""}
          ${description}
          ${inputHtml}
          <div class="v4a-modal-actions">
            ${hasCancel ? `<button type="button" class="v4a-btn v4a-btn--ghost" data-action="cancel">${renderText(opts.cancelText || "Annuleren")}</button>` : ""}
            <button type="button" class="v4a-btn v4a-btn--primary" data-action="confirm">${renderText(opts.confirmText || "Doorgaan")}</button>
          </div>
        </div>
      `;

      const modal = overlay.querySelector(".v4a-modal");
      const input = overlay.querySelector("#v4a-modal-input");
      const errorEl = overlay.querySelector(".v4a-modal-error");
      const confirmBtn = overlay.querySelector('[data-action="confirm"]');
      const cancelBtn = overlay.querySelector('[data-action="cancel"]');
      const previousFocus = document.activeElement;

      function setError(message) {
        if (!errorEl) return;
        errorEl.textContent = message || "";
      }

      function submit() {
        let nextValue = null;

        if (input) {
          const rawValue = input.value || "";
          nextValue = opts.trimInput === false ? rawValue : rawValue.trim();

          if (opts.required && !nextValue) {
            setError(opts.errorMessage || "Vul dit veld in om verder te gaan.");
            input.focus();
            return;
          }

          if (!opts.readOnly && inputType === "email" && nextValue && !EMAIL_PATTERN.test(nextValue)) {
            setError(opts.emailErrorMessage || "Vul een geldig e-mailadres in.");
            input.focus();
            return;
          }

          setError("");
        }

        closeActiveModal({ confirmed: true, value: nextValue });
      }

      const onKeyDown = function (event) {
        if (!activeModal || activeModal.overlay !== overlay) return;
        if (event.key === "Escape") {
          event.preventDefault();
          closeActiveModal({ confirmed: false, value: null });
          return;
        }
        if (event.key === "Enter" && input && document.activeElement === input) {
          event.preventDefault();
          submit();
        }
      };

      overlay.addEventListener("click", function (event) {
        if (event.target === overlay) {
          closeActiveModal({ confirmed: false, value: null });
        }
      });
      confirmBtn?.addEventListener("click", submit);
      cancelBtn?.addEventListener("click", function () {
        closeActiveModal({ confirmed: false, value: null });
      });

      root.appendChild(overlay);
      document.body.classList.add("v4a-feedback-lock");
      document.addEventListener("keydown", onKeyDown, true);
      activeModal = { overlay: overlay, onKeyDown: onKeyDown, resolve: resolve, previousFocus: previousFocus };

      window.requestAnimationFrame(function () {
        overlay.classList.add("is-visible");
        if (input) {
          input.focus({ preventScroll: true });
          if (opts.selectOnOpen) input.select();
        } else {
          (confirmBtn || modal)?.focus?.({ preventScroll: true });
        }
      });
    });
  }

  function showConfirmDialog(options) {
    return openModal(options).then(function (result) {
      return !!result?.confirmed;
    });
  }

  function showPromptDialog(options) {
    return openModal(Object.assign({}, options, { input: true })).then(function (result) {
      return result?.confirmed ? result.value : null;
    });
  }

  function requestEmail(options) {
    const opts = options || {};
    return showPromptDialog({
      kicker: opts.kicker || "Reactie",
      title: opts.title || "Reageren via Voetbal4All",
      message: opts.message || "Vul je e-mailadres in om verder te gaan.",
      description: opts.description || "Door verder te gaan, ga je akkoord dat jouw e-mailadres gebruikt wordt om te reageren via Voetbal4All.",
      label: opts.label || "E-mailadres",
      placeholder: opts.placeholder || "naam@club.be",
      inputType: "email",
      confirmText: opts.confirmText || "Akkoord en doorgaan",
      cancelText: opts.cancelText || "Annuleren",
      required: true,
      tone: opts.tone || "success",
      errorMessage: opts.errorMessage || "E-mailadres is nodig om te kunnen reageren.",
      emailErrorMessage: opts.emailErrorMessage || "Vul een geldig e-mailadres in."
    }).then(function (value) {
      return value ? value.trim() : null;
    });
  }

  async function copyText(text, options) {
    const opts = options || {};
    const shareText = String(text || "");

    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(shareText);
      toast(opts.successMessage || "Link gekopieerd.", {
        tone: opts.tone || "success",
        title: opts.successTitle || "Gekopieerd",
        duration: opts.duration
      });
      return true;
    } catch (_) {
      await showPromptDialog({
        kicker: opts.fallbackKicker || "Kopieer link",
        title: opts.fallbackTitle || "Kopieer deze link",
        message: opts.fallbackMessage || "Kopieer de link hieronder en plak hem waar je hem nodig hebt.",
        label: opts.fallbackLabel || "Deellink",
        value: shareText,
        readOnly: true,
        selectOnOpen: true,
        trimInput: false,
        confirmText: opts.fallbackConfirmText || "Sluiten",
        cancelText: "",
        tone: opts.fallbackTone || "info"
      });
      return false;
    }
  }

  window.V4AFeedback = {
    toast: toast,
    confirm: showConfirmDialog,
    prompt: showPromptDialog,
    requestEmail: requestEmail,
    copyText: copyText
  };
})();
