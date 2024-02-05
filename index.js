const express = require('express');
const app = express();
const port = 8001;
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.set('views', './template.ejs')
app.set('view engine', 'ejs')
const router = require('./src/routes/router')


app.get('/blanks', router);
app.listen(port, () => console.log(`Port listen in  ${port}`));