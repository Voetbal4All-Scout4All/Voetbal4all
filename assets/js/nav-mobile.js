(() => {
 let burger = null;
 let nav = null;
 function closeAll() {
 if (!nav || !burger) return;
 nav.classList.remove("is-open");
 burger.setAttribute("aria-expanded", "false");
 document
 .querySelectorAll(".nav-item--dropdown.is-open")
 .forEach((x) => x.classList.remove("is-open"));
 }
 document.addEventListener("DOMContentLoaded", () => {
 burger = document.querySelector(".nav-burger");
 nav = document.querySelector(".nav-links");
 if (!burger || !nav) return;
 closeAll();
 burger.addEventListener("click", (e) => {
 e.preventDefault();
 e.stopPropagation();
 const open = nav.classList.toggle("is-open");
 burger.setAttribute("aria-expanded", open ? "true" : "false");
 if (!open) {
 document
 .querySelectorAll(".nav-item--dropdown.is-open")
 .forEach((x) => x.classList.remove("is-open"));
 }
 });
 nav.querySelectorAll(".nav-item--dropdown > .nav-link--dropdown").forEach((btn) => {
 btn.addEventListener("click", (e) => {
 e.preventDefault();
 e.stopPropagation();
 const item = btn.closest(".nav-item--dropdown");
 if (!item) return;
 nav.querySelectorAll(".nav-item--dropdown").forEach((x) => {
 if (x !== item) x.classList.remove("is-open");
 });
 item.classList.toggle("is-open");
 });
 });
 document.addEventListener("click", closeAll);
 nav.addEventListener("click", (e) => e.stopPropagation());
 });
})();