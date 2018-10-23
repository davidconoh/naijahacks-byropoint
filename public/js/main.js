
(function () {
  'use strict';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader')
  };

  // Updates articles from server or localStorage
  app.updateArticle = function (data) {
    // Build html
    let html = '';
    html += `
    <h2>${data.title}</h1>
    <h5>${data.subtitle || ''}</h5>
    <ul>
    `
    data.paragraphs.forEach(para => {
      html += `<li>${para}</li>`
    });
    html += `</ul>
    <small>Date: ${new Date(data.createdAt).toLocaleString()}</small>
    `

    let article = document.getElementById('article');
    article.removeAttribute('hidden');
    article.innerHTML = html;


    // Remove spinner
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
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

  // Request notification access
  if (Notification.permission === "granted") {
    console.log('Push granted')
  } else if (Notification.permission === "blocked" || Notification.permission === "denied") {
    alert('You can not use this app without notifications, please allow it');
    Notification.requestPermission();
    /* the user has previously denied push. Can't reprompt. */
  } else {
    console.log('Push not granted')
    /* show a prompt to the user */
    Notification.requestPermission();
  }

  // Check for service worker
  if ("serviceWorker" in navigator) {
    // Register it
    navigator.serviceWorker.register('../sw.js').then(reg => {
      console.log('Service worker registered!');
      reg.pushManager.getSubscription().then(subscription => {
        if (subscription === null) {
          // Not subscribed yet, so subscribe      
          console.log("Subscribing to push...");
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          }).then(subscription => {
            console.log("posting push subscription data...");
            // Post the sub object...service worker will listen for server response
            // And update accordingly
            fetch("/subscribe", {
              method: "POST",
              body: JSON.stringify(subscription),
              headers: {
                "content-type": "application/json"
              }
            }).then(res => {
              console.log(res);
              console.log("Posting complete. Push subscribed...");
            }).catch(err => {
              if (Notification.permission === 'denied' || Notification.permission === 'blocked') {
                alert('Permission for notifications was denied');
                console.error('Unable to subscribe to push', err);
              } else {
                console.error('Unable to subscribe to push', err);
              }
            });
          }).catch(err => console.log(err));
        } else {
          // Subscribed
          // Get data, with this subscription object
          console.log('Fetching article');
          fetch('/article/latest/', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
              "content-type": "application/json"
            }
          }).then(res => console.log(res))
            .catch(err => console.log(err))
        }
      })
    }).catch(err => console.log('Service worker reg failed.'));

    // Listen to messages from service workers.
    navigator.serviceWorker.addEventListener('message', function (event) {
      app.updateArticle(event.data);
      console.log("Got reply from service worker: ", event.data);
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

