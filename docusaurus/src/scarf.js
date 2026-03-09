// Scarf pixel – SPA-aware tracking for the Docusaurus documentation site.
// This client module fires on the initial page load and on every subsequent
// in-app navigation so that each page view is recorded, even in a SPA where
// the full page is never reloaded.

const PIXEL_ID = '7c25872d-249e-45d8-aa99-0d0e3421c29e';

let lastHref = null;

function sendScarfPing() {
  if (typeof window === 'undefined') return;

  const currentHref = window.location.href;
  if (currentHref === lastHref) return; // dedup: skip if same page
  lastHref = currentHref;

  const url = `https://static.scarf.sh/a.png?x-pxid=${PIXEL_ID}`;
  const img = new Image();
  img.referrerPolicy = 'no-referrer-when-downgrade';
  img.src = url;
}

// Docusaurus client-module lifecycle hook – called after every route update
// (initial load + every SPA navigation).
export function onRouteDidUpdate() {
  sendScarfPing();
}
