// assets/js/image-utils.js
// Single source of truth voor alle image-URLs

(function () {
  const API_BASE = "https://voetbal4all-backend-database.onrender.com";
  const PLACEHOLDER = "assets/img/placeholder.svg";

  function getPlaceholderPath() {
    return PLACEHOLDER;
  }

  function isPlaceholderValue(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw || raw === "[object object]") return true;

    return (
      raw === "placeholder" ||
      raw === "placeholder.svg" ||
      raw.endsWith("/placeholder.svg") ||
      raw.includes("placeholder.svg?") ||
      raw.startsWith("/images/placeholder") ||
      raw.includes("/images/placeholder") ||
      raw.includes("assets/img/placeholder.svg")
    );
  }

  function resolveImageUrl(imageVal) {
    if (!imageVal) return getPlaceholderPath();

    let raw = "";
    if (typeof imageVal === "string") {
      raw = imageVal;
    } else if (typeof imageVal === "object") {
      raw = String(
        imageVal.image ||
        imageVal.image_url ||
        imageVal.image_path ||
        imageVal.imagePath ||
        imageVal.publicPath ||
        imageVal.path ||
        imageVal.url ||
        imageVal.href ||
        imageVal.src ||
        ""
      );
    }

    raw = (raw || "").toString().trim();
    if (isPlaceholderValue(raw)) return getPlaceholderPath();

    const clean = raw.trim();

    if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
    if (clean.startsWith("/")) return API_BASE + clean;
    
    return API_BASE + "/" + clean;
  }

  window.V4AImage = {
    resolve: resolveImageUrl,
    placeholder: PLACEHOLDER,
    getPlaceholder: getPlaceholderPath,
    isPlaceholder: isPlaceholderValue,
  };
})();
