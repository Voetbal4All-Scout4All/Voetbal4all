// assets/js/nav-mobile.js
(() => {
  let burger = null;
  let nav = null;

  function closeAll() {
    if (!nav || !burger) return;

    // Always normalize state (also on initial load)
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

    // Forceer start: menu dicht
    closeAll();

    // Burger togglet hoofdmenu
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

    // Dropdowns in burger-menu
    nav.querySelectorAll(".nav-item--dropdown > .nav-link--dropdown").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const item = btn.closest(".nav-item--dropdown");
        if (!item) return;

        // Sluit andere dropdowns
        nav.querySelectorAll(".nav-item--dropdown").forEach((x) => {
          if (x !== item) x.classList.remove("is-open");
        });

        // Toggle deze dropdown
        item.classList.toggle("is-open");
      });
    });

    // Klik buiten menu = sluiten
    document.addEventListener("click", closeAll);

    // Klik binnen nav mag het menu niet sluiten
    nav.addEventListener("click", (e) => e.stopPropagation());
  });
})();