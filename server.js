const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const webpush = require('web-push');
const request = require('request');
const subService = require('./services/subscription');
const postService = require('./services/post');
const Post = require('./_helpers/db').Post;

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
      const payload = JSON.stringify({
        notification: {
          title: 'Error',
          body: "Not subscribed, please refresh your page"
        }
      });

      res.status(201).json({});

      // Pass object into sendNotification
      webpush
        .sendNotification(subscription, payload)
        .catch(err => console.error(err));
    });
});

// Article route
app.post('/article/latest', (req, res) => {
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
function updatePosts() {
  let working = false;
  // Return a closure
  if (!updatePosts.called) {
    this.called = true;

    return function () {
      if (working) return console.log('working...');
      working = true;
      Post.findOne().sort({ createdAt: -1 }).exec(function (err, post) {
        if (post) {
          // Post exit
          console.log('Checking for new post')
          getPostRemote().then(Post => {
            for (let new_post in Post) {
              // Extract params
              const { id, title, createdAt } = Post[new_post];
              // Compare if the in coming is latest
              if (post.createdAt == createdAt) {
                console.log('No new post');
                working = false
              } else {
                // New post
                console.log('New post found');
                // Add it and send it to users
                // Get texts only from the paragraphs
                let paragraphs = Post[post].previewContent
                  .bodyModel.paragraphs.map(para => para.tetx);
                // Get the subtitle
                let subtitle = Post[post].previewContent.bodyModel.subtitle;
                let newPost = { paragraphs, id, title, createdAt, subtitle };
                postService.add(newPost);
                console.log('new post added');

                pushNewPost(newPost);
                working = false
              }
            }
          }).catch(err => {
            working = false
            console.error(err)
          });
        } else {
          // No post
          console.log('Getting fresh posts');
          getPostRemote().then(Post => {
            for (let post in Post) {
              // Extract params
              const { id, title, createdAt } = Post[post];
              // Get texts only from the paragraphs
              let paragraphs = Post[post].previewContent
                .bodyModel.paragraphs.map(para => para.tetx);
              // Get the subtitle
              let subtitle = Post[post].previewContent.bodyModel.subtitle;

              postService.add({ paragraphs, id, title, createdAt, subtitle });
              console.log('done Getting fresh posts');
              working = false
            }
          }).catch(err => {
            working = false
            console.error(err)
          });
        }
      });

    };
  } else {
    throw 'You can not call updatePosts() more than once.'
  }
}
updatePosts.called = false;
// Capture an instance of updatePosts()
updatePosts = updatePosts();

setInterval(updatePosts, 1000);

// Get post
function getPostRemote() {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      url: 'https://medium.com/@itswisdomagain/latest?format=json',
    }, function (err, resp, body) {
      if (!err) {
        // Strip off unwanted stuff from the body
        const Post = JSON.parse(body.replace('])}while(1);</x>', '')).payload.references.Post
        resolve(Post);
      }
      reject(err)
    });
  })
}

function pushNewPost(post) {
  // Get all subscribers
  subService.getAll().then(subs => {
    // Send them push notification
    subs.forEach(sub => {
      // Send latest article
      const payload = JSON.stringify({
        notification: {
          title: 'New Article',
          body: "Check app"
        },
        article: post
      });

      res.status(201).json({});

      // Pass object into sendNotification
      webpush
        .sendNotification(sub, payload)
        .catch(err => console.error(err));
    })
  })
}
// Serve static files
app.use(express.static(path.join('public')));

app.listen(PORT, () => console.log(`server running at port: ${PORT}`))