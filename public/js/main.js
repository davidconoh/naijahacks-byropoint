/**
 * Service Workers
 */

// Make sure that service worker is supported
if (navigator.serviceWorker) {
  window.onload = () => {
    navigator.serviceWorker
      .register('../sw.js')
      .then(reg => console.log('Service worker registered with scope: '+reg.scope))
      .catch(err => console.log(err))
  }
}