/* Counts visits and button clicks, so we can tell which post or link brings people. No cookies. No address, no
   browser details and no personal data are sent. It does nothing if the visitor has asked not to be tracked. */
(function () {
  try {
    var API = "https://growth-engine-ndty.onrender.com/api/public/event";
    var tag = document.currentScript;
    var SITE = (tag && tag.getAttribute("data-site")) || "other";
    if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl) return;

    var q = new URLSearchParams(location.search);
    var src = q.get("utm_source") || undefined;
    var med = q.get("utm_medium") || undefined;
    var camp = q.get("utm_campaign") || undefined;
    try {
      if (src) sessionStorage.setItem("ge_utm", JSON.stringify({ s: src, m: med, c: camp }));
      else {
        var saved = JSON.parse(sessionStorage.getItem("ge_utm") || "null");
        if (saved) { src = saved.s; med = saved.m; camp = saved.c; }
      }
    } catch (e) { /* storage may be blocked; that is fine */ }

    function send(name) {
      var body = JSON.stringify({ name: name, site: SITE, path: location.pathname, source: src, medium: med, campaign: camp, referrer: document.referrer || undefined });
      try {
        var ok = navigator.sendBeacon && navigator.sendBeacon(API, new Blob([body], { type: "text/plain" }));
        if (!ok) fetch(API, { method: "POST", body: body, keepalive: true, mode: "no-cors" });
      } catch (e) { /* counting must never break the page */ }
    }

    send("pageview");
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var h = a.href || "";
      if (h.indexOf("kaldrix-sandbox") > -1) send("demo_click");
      else if (h.indexOf("github.com") > -1) send("github_click");
      else if (h.indexOf("linkedin.com") > -1) send("linkedin_click");
      else if (a.classList && a.classList.contains("btn")) send("cta_click");
    }, true);
  } catch (e) { /* never break the page */ }
})();
