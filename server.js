const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path')

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res)=>{
  res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.listen(PORT, () => console.log(`server running at port: ${PORT}`))