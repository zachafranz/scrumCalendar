const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/', express.static(path.join(__dirname, "./../../dist")))  

// app.get('/', (req, res) => {
//     // res.sendFile(path.join(__dirname, "./../../dist/index.html"))
// })

app.listen(3000, (err) => {
    if (err) {console.log('error in connecting to port 3000:', err)}
    else {console.log('Listening on port 3000!')}
})