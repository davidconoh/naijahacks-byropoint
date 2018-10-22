const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.all('/', (req, res)=>{
  res.send('We are ready!');
})

app.listen(PORT, () => console.log(`server running at port: ${PORT}`))