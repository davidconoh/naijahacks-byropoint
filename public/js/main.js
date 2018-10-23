
(function () {
  'use strict';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('butRefresh').addEventListener('click', function () {
    // Refresh all of the forecasts
    app.updateForecasts();
  });

  document.getElementById('butAdd').addEventListener('click', function () {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Updates articles from server or localStorage
  app.updateArticle = function (data) {

    // Remove spinner
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };

  /************************************************************************
   *
   * Code required to start the app
   *
   ************************************************************************/

  // TODO add startup code here
  // app.latestArticle = localStorage.latestArticle;
  if (app.latestArticles) {
    //Do sth with them
  } else {
    /* The user is using the app for the first time
     */

    //Do sth apprt
  }

  // Register service worker and push notification
  const publicVapidKey =
    "BAEbRVTU-0QL2AcBwipWM8HDR7Qf8Cz0c0nCkJLQh-rOjiqjUonpzT4g0q_5TBy8_cFxR1RfEVVt0EbaU_9y594";

  // Check for service worker
  if ("serviceWorker" in navigator) {
    send().catch(err => console.error(err));
  }

  // Register SW, Register Push, Send Push
  async function send() {
    // Register Service Worker
    console.log("Registering service worker...");
    const register = await navigator.serviceWorker.register("/sw.js", {
      scope: "/"
    });
    console.log("Service Worker Registered...");

    // Register Push
    console.log("Registering Push...");
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    console.log("Push Registered...");

    // Send Push Notification
    console.log("Sending Push...");
    await fetch("/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
      headers: {
        "content-type": "application/json"
      }
    });
    console.log("Push Sent...");

    // Listen for messages

    // Listen to messages from service workers.
    navigator.serviceWorker.addEventListener('message', function (event) {
      console.log("Got reply from service worker: " + event.data);
    });

  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
})();

