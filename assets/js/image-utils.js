// assets/js/image-utils.js
// Single source of truth voor alle image-URLs

(function () {
  const API_BASE = "https://voetbal4all-backend-database.onrender.com";
  const PLACEHOLDER = "assets/img/placeholder.svg";

  function resolveImageUrl(imageVal) {
    if (!imageVal) return PLACEHOLDER;

    let raw = "";
    if (typeof imageVal === "string") {
      raw = imageVal;
    } else if (typeof imageVal === "object") {
      raw = String(
        imageVal.publicPath ||
        imageVal.url ||
        imageVal.src ||
        ""
      );
    }

    raw = (raw || "").toString().trim();
    if (!raw || raw === "[object Object]") return PLACEHOLDER;
    if (raw.toLowerCase().includes("placeholder")) return PLACEHOLDER;

    const clean = raw.split("?")[0];

    if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
    if (clean.startsWith("/")) return API_BASE + clean;

    return API_BASE + "/" + clean;
  }

  window.V4AImage = {
    resolve: resolveImageUrl,
    placeholder: PLACEHOLDER,
  };
})();
