// assets/js/ads-guard.js — Suppress ad loading for test/admin traffic.
// Querystring: ?noads=1 sets localStorage flag + strips param; ?noads=0 clears it.
// When flag active: removes adsbygoogle script, stubs push() to prevent impressions.
(function () {
  var params = new URLSearchParams(window.location.search);
  if (params.get('noads') === '1') {
    localStorage.setItem('v4a_ads_off', '1');
    params.delete('noads');
    var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
    window.history.replaceState(null, '', clean);
  } else if (params.get('noads') === '0') {
    localStorage.removeItem('v4a_ads_off');
    params.delete('noads');
    var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + window.location.hash;
    window.history.replaceState(null, '', clean);
  }

  if (localStorage.getItem('v4a_ads_off') === '1') {
    // Remove any adsbygoogle script tag already in head
    var scripts = document.querySelectorAll('script[src*="adsbygoogle"]');
    for (var i = 0; i < scripts.length; i++) scripts[i].remove();
    // Stub adsbygoogle to silently swallow push() calls
    window.adsbygoogle = { push: function () {} };
    // Hide any existing ad containers
    document.addEventListener('DOMContentLoaded', function () {
      var ads = document.querySelectorAll('ins.adsbygoogle, .ad-slot, .v4a-ad-sidebar, .v4a-ad-bottom');
      for (var j = 0; j < ads.length; j++) ads[j].style.display = 'none';
    });
  }
})();
