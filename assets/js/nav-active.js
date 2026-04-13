(() => {
 "use strict";
 function normPath(p) {
 try { return (p || "").split("#")[0].split("?")[0].trim(); }
 catch (_) { return (p || "").trim(); }
 }
 function currentFile() {
 const p = normPath(window.location.pathname || "");
 const last = (p.split("/").filter(Boolean).pop() || "");
 return last || "index.html";
 }
document.addEventListener("DOMContentLoaded", () => {
 const nav = document.querySelector(".nav-links");
 if (!nav) return;
 const links = Array.from(nav.querySelectorAll("a.nav-link"));
 const dropdownButtons = Array.from(nav.querySelectorAll(".nav-item--dropdown > .nav-link--dropdown"));
 const topLevelLinks = [...links, ...dropdownButtons];
 if (!topLevelLinks.length) return;
 topLevelLinks.forEach((link) => {
 link.classList.remove("nav-link--active");
 if (link.classList.contains("nav-link--dropdown")) {
 link.style.removeProperty("color");
 link.style.removeProperty("border-color");
 }
 });
 const cur = currentFile();
 let hit = null;
 for (const a of links) {
 const href = normPath(a.getAttribute("href") || "");
 const file = (href.split("/").filter(Boolean).pop() || "");
 if (!file) continue;
 if ((cur === "" || cur === "index.html") && (file === "index.html" || file === "/")) { hit = a; break; }
 if (file === cur) { hit = a; break; }
 }
 if (!hit && (cur === "" || cur === "index.html")) {
 hit = links.find(a => normPath(a.getAttribute("href") || "").endsWith("index.html")) || null;
 }
 if (!hit) {
 for (const btn of dropdownButtons) {
 const item = btn.closest(".nav-item--dropdown");
 if (!item) continue;
 const matches = Array.from(item.querySelectorAll(".nav-dropdown-link")).some((a) => {
 const href = normPath(a.getAttribute("href") || "");
 const file = (href.split("/").filter(Boolean).pop() || "");
 return !!file && file === cur;
 });
 if (!matches) continue;
 hit = btn;
 break;
 }
 }
 if (hit) {
 hit.classList.add("nav-link--active");
 if (hit.classList.contains("nav-link--dropdown")) {
 hit.style.color = "var(--text)";
 hit.style.borderColor = "var(--accent)";
 }
 }
 });
})();
(function () {
 try {
 const path = (window.location.pathname || '').toLowerCase();
 if (!path.endsWith('/bedankt.html') && !path.endsWith('bedankt.html')) return;
 const qs = new URLSearchParams(window.location.search);
 const source = (qs.get('source') || '').trim();
 const sid = (qs.get('sid') || '').trim();
 const paid = (qs.get('paid') || '').trim() === '1';
 const errorFlag = (qs.get('error') || '').trim();
 const reason = (qs.get('reason') || qs.get('message') || '').trim();
 const name = (qs.get('name') || '').trim();
 const email = (qs.get('email') || '').trim();
 const what = (qs.get('what') || qs.get('product') || qs.get('type') || '').trim();
 const id = (sid || qs.get('id') || qs.get('orderId') || qs.get('eventId') || qs.get('submissionId') || '').trim();
 const status = (qs.get('status') || 'Ontvangen').trim();
 const statusLower = String(status).toLowerCase();
 const isError = errorFlag === '1' || statusLower === 'error' || statusLower === 'failed' || statusLower === 'mislukt';
 const safeText = (v) => (v ? String(v).replace(/\s+/g, ' ').trim() : '');
 const translateReasonNL = (raw) => {
 const r = safeText(raw);
 if (!r) return '';
 const low = r.toLowerCase();
 if (low.includes('expired') && low.includes('confirmation')) {
 return 'Deze bevestigingslink is verlopen. Dien het event opnieuw in om een nieuwe bevestigingsmail te ontvangen.';
 }
 if (low.startsWith('duplicate submission') || low.includes('duplicate submission')) {
 return 'Dubbele aanvraag: dit e-mailadres heeft al een event aangemeld voor dezelfde datum.';
 }
 if (low.includes('invalid token') || (low.includes('token') && (low.includes('invalid') || low.includes('missing') || low.includes('expired')))) {
 return 'Ongeldige of beschadigde bevestigingslink. Vraag een nieuwe bevestigingsmail aan of dien het event opnieuw in.';
 }
 const looksEnglish = /\b(this|already|submitted|event|date|expired|confirmation|token|invalid|duplicate)\b/i.test(r);
 if (looksEnglish) {
 return 'Uw aanvraag kon niet verwerkt worden. Controleer uw gegevens en probeer opnieuw. Voor meer info kan u ons contacteren via het contactformulier.';
 }
 return r;
 };
 const setText = (elId, value, fallback = '—') => {
 const el = document.getElementById(elId);
 if (!el) return;
 const v = safeText(value);
 el.textContent = v || fallback;
 };
 const iconWrap = document.getElementById('thanksIcon');
 if (iconWrap) {
 if (isError) {
 iconWrap.style.display = 'none';
 } else {
 iconWrap.style.display = '';
 iconWrap.classList.remove('is-animate');
 void iconWrap.offsetWidth; 
 iconWrap.classList.add('is-animate');
 }
 }
 const pendingNotice = document.getElementById('pendingNotice');
 if (pendingNotice) pendingNotice.style.display = (!isError && statusLower === 'pending') ? '' : 'none';
 const emailKeepNotice = document.getElementById('emailKeepNotice');
 if (emailKeepNotice) {
 const isEventFlow = !!sid || source === 'event';
 emailKeepNotice.style.display = (!isError && isEventFlow) ? '' : 'none';
 if (!isError && isEventFlow && paid) {
 const lis = emailKeepNotice.querySelectorAll('li');
 if (lis && lis[0]) lis[0].innerHTML = 'Bewaar de e-mail met uw <strong>Event-ID</strong> tot na het event.';
 }
 }
 const errorNotice = document.getElementById('errorNotice');
 if (errorNotice) {
 if (isError) {
 errorNotice.style.display = '';
 errorNotice.classList.remove('is-animate');
 void errorNotice.offsetWidth; 
 errorNotice.classList.add('is-animate');
 } else {
 errorNotice.style.display = 'none';
 errorNotice.classList.remove('is-animate');
 }
 const reasonEl = document.getElementById('errorReasonText');
 if (isError && reasonEl) {
 const reasonNL = translateReasonNL(reason);
 reasonEl.textContent = reasonNL || 'Uw aanvraag voldoet momenteel niet aan de voorwaarden (bijvoorbeeld: er bestaat al een gelijkaardig event op dezelfde datum).';
 }
 }
 const titleEl = document.getElementById('thanksTitle');
 const subEl = document.getElementById('thanksSubtitle');
 if (titleEl && subEl) {
 const isEventFlow = !!sid || source === 'event';
 if (isError) {
 titleEl.textContent = 'Uw aanvraag kon niet verwerkt worden';
 subEl.textContent = 'Controleer uw gegevens en probeer opnieuw. Voor meer info kan u ons contacteren via het contactformulier.';
 } else if (isEventFlow) {
 if (paid) {
 titleEl.textContent = 'Bedankt. Uw Premium event is succesvol aangemeld.';
 subEl.textContent = 'Uw event wordt verwerkt volgens de Premium-voorwaarden. Bewaar de e-mail met uw Event-ID tot na het event.';
 } else {
 titleEl.textContent = 'Uw aanvraag is goed ontvangen';
 subEl.textContent = 'U ontvangt een e-mail met verdere instructies om uw aanvraag te bevestigen. Bewaar die e-mail tot na het event.';
 }
 }
 }
 const badgeEl = document.getElementById('thanksBadge');
 if (badgeEl) {
 const parts = [];
 const isEventFlow = !!sid || source === 'event';
 if (isEventFlow) parts.push(isError ? 'EVENT · NIET VERWERKT' : (paid ? 'EVENT · PREMIUM' : 'EVENT'));
 else if (source) parts.push(source.toUpperCase());
 if (id) parts.push('#' + id);
 if (parts.length) {
 badgeEl.style.display = 'inline-flex';
 badgeEl.textContent = parts.join(' · ');
 } else badgeEl.style.display = 'none';
 }
 const isEventFlow2 = !!sid || source === 'event';
 const whatResolved = what || (isEventFlow2 ? 'Event-aanmelding' : (source ? ('Aanvraag: ' + source) : ''));
 setText('orderWhat', whatResolved, 'Aanvraag ontvangen');
 setText('orderId', id, '—');
 setText('orderName', name, '—');
 setText('orderEmail', email, '—');
 setText('orderStatus', isError ? 'Niet verwerkt' : status, 'Ontvangen');
 const nextIntro = document.getElementById('nextStepsIntro');
 const nextTip = document.getElementById('nextStepsTip');
 if (nextIntro && nextTip && isEventFlow2) {
 if (isError) {
 nextIntro.textContent = 'Uw aanvraag kon niet verwerkt worden.';
 nextTip.textContent = 'Voor meer info, contacteer ons via het contactformulier.';
 } else if (paid) {
 nextIntro.textContent = 'Uw Premium event wordt verwerkt en verschijnt op Voetbal4All volgens de Premium-voorwaarden.';
 nextTip.textContent = 'Tip: bewaar de e-mail met uw Event-ID tot na het event. Dit helpt ons u sneller te ondersteunen indien nodig.';
 } else {
 nextIntro.textContent = 'U ontvangt een e-mail met een bevestigingsstap. Zonder bevestiging wordt een niet-premium aanvraag niet gepubliceerd.';
 nextTip.textContent = 'Tip: bewaar de e-mail met uw Event-ID tot na het event. Beheer (bevestigen, verwijderen, contact) verloopt via die e-mail.';
 }
 }
 } catch (e) {}
})();
