const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const webpush = require('web-push');
const request = require('request');
const subService = require('./services/subscription');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Push notification
const publicVapidKey =
  "BAEbRVTU-0QL2AcBwipWM8HDR7Qf8Cz0c0nCkJLQh-rOjiqjUonpzT4g0q_5TBy8_cFxR1RfEVVt0EbaU_9y594";
const privateVapidKey = "zSfu6TekwBv8tgpukQ27pDP_bFGLSxiye3p-TK15qf8";

webpush.setVapidDetails(
  "mailto:brigtomex@gmail.com",
  publicVapidKey,
  privateVapidKey
);

// Subscribe Route
app.post("/subscribe", (req, res) => {
  // Get pushSubscription object
  const subscription = req.body;

    // Store subscription in db
    subService.add(subscription)
      .then(done => {
        // Stored succesfully
        // Send 201 - resource created
        res.status(201).json({});
        // Send latest article
        // Create payload
        const payload = JSON.stringify({
          notification: {
            title: 'New Article',
            body: "Check app"
          },
          article: {
            heading: 'Test',
            body: 'Hello, health world!'
          }
        });

        // Pass object into sendNotification
        webpush
          .sendNotification(subscription, payload)
          .catch(err => console.error(err));
      }).catch(err => {
        // Not stored succesfully
        // TODO check if the error is due to the existence of the subscription in the database
        // Create payload
        const payload = JSON.stringify({ notification: {
          title: 'Error', 
          body: "Not subscribed, please refresh your page" 
        }});

        res.status(201).json({});

        // Pass object into sendNotification
        webpush
          .sendNotification(subscription, payload)
          .catch(err => console.error(err));
      });
});

// Article route
app.post('/article/latest', (req,res)=>{
  let subscription = req.body;
  // Send latest article
  const payload = JSON.stringify({
    notification: {
      title: 'New Article',
      body: "Check app"
    },
    article: {
      heading: 'Test',
      body: 'Hello, health world!'
    }
  });

  res.status(201).json({});

  // Pass object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.error(err));
});

// Periodic update of articles

// Serve static files
app.use(express.static(path.join('public')));

app.listen(PORT, () => console.log(`server running at port: ${PORT}`))