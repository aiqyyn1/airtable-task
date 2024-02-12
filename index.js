const express = require('express');
const app = express();
const port = 8001;
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.set('views', './src/views/');
const router = require('./src/routes/router');
const router1 = require('./src/controllers/second.controller');
app.get('/blanks', router);
app.get('/blanks1', router1);

app.listen(port, () => console.log(`Port listen in  ${port}`));
