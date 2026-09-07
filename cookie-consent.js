/**
 * Wayne Conrad Advisory — site-wide cookie consent.
 * Include this ONE file on every page, right before </body>:
 *   <script src="/cookie-consent.js" defer></script>
 *
 * What it does:
 * - Injects a small consent card (bottom-left) styled to match the site.
 * - Google Analytics (GA4) and Google Tag Manager only load AFTER the
 *   visitor clicks Accept. Nothing is set on Decline or before a choice
 *   is made.
 * - Remembers the choice in localStorage (wc_cookie_consent), so it only
 *   asks once per browser.
 * - Exposes window.showCookieBanner() so a page can add a "Manage Cookies"
 *   link/button anywhere (footer, privacy page, etc.) that reopens it.
 *
 * To change the GA/GTM IDs, edit GA_ID and GTM_ID below — one place,
 * applies to every page that includes this script.
 */
(function () {
  var GA_ID = 'G-4B6HCGLY1N';
  var GTM_ID = 'GTM-N8JWZVGH';
  var CONSENT_KEY = 'wc_cookie_consent';

  // ---- Analytics loader (only ever called after consent) ----
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }

  function loadAnalytics() {
    if (window.__analyticsLoaded) return;
    window.__analyticsLoaded = true;

    var gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(gtagScript);

    gtag('js', new Date());
    gtag('config', GA_ID);

    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);
  }

  // ---- Styles (injected once) ----
  var style = document.createElement('style');
  style.textContent =
    '#cookie-consent{position:fixed;left:20px;bottom:20px;z-index:9999;width:320px;' +
    'max-width:calc(100% - 40px);background:#fff;border:1px solid #e2e8f0;' +
    'border-radius:12px;padding:20px;box-shadow:0 12px 32px rgba(15,23,42,0.18);' +
    "font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}" +
    '#cookie-consent.hidden{display:none;}' +
    '#cookie-consent-title{font-size:14px;font-weight:700;color:#0f172a;margin:0 0 8px;}' +
    '#cookie-consent-text{font-size:13px;line-height:1.55;color:#6b7280;margin:0 0 16px;}' +
    '#cookie-consent-text a{color:#2d5be3;text-decoration:underline;}' +
    '#cookie-consent-buttons{display:flex;gap:8px;}' +
    '#cookie-consent-buttons button{font-size:13px;font-weight:600;padding:9px 14px;' +
    'border-radius:6px;border:none;cursor:pointer;flex:1;transition:background .2s,border-color .2s;}' +
    '#cookie-accept{background:#2d5be3;color:#fff;}' +
    '#cookie-accept:hover{background:#1e4bcf;}' +
    '#cookie-decline{background:#f8fafc;color:#0f172a;border:1px solid #e2e8f0 !important;}' +
    '#cookie-decline:hover{background:#edf1f5;}' +
    '@media (max-width:480px){#cookie-consent{left:12px;right:12px;bottom:12px;width:auto;}}';
  document.head.appendChild(style);

  // ---- Markup (injected once, on DOM ready) ----
  function injectBanner() {
    var el = document.createElement('div');
    el.id = 'cookie-consent';
    el.className = 'hidden';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML =
      '<p id="cookie-consent-title">Cookies</p>' +
      '<p id="cookie-consent-text">This site uses Google Analytics and Google Tag Manager to understand how visitors use the pages. No cookies are set until you accept. See the <a href="/privacy.html">privacy policy</a> for details.</p>' +
      '<div id="cookie-consent-buttons">' +
      '<button id="cookie-decline">Decline</button>' +
      '<button id="cookie-accept">Accept</button>' +
      '</div>';
    document.body.appendChild(el);

    document.getElementById('cookie-accept').addEventListener('click', acceptCookies);
    document.getElementById('cookie-decline').addEventListener('click', declineCookies);

    var consent = localStorage.getItem(CONSENT_KEY);
    if (consent === 'granted') {
      loadAnalytics();
    } else if (!consent) {
      el.classList.remove('hidden');
    }
  }

  function acceptCookies() {
    localStorage.setItem(CONSENT_KEY, 'granted');
    document.getElementById('cookie-consent').classList.add('hidden');
    loadAnalytics();
  }

  function declineCookies() {
    localStorage.setItem(CONSENT_KEY, 'denied');
    document.getElementById('cookie-consent').classList.add('hidden');
  }

  window.showCookieBanner = function () {
    var el = document.getElementById('cookie-consent');
    if (el) el.classList.remove('hidden');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBanner);
  } else {
    injectBanner();
  }
})();
