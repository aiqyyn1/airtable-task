const express = require('express');
const app = express();
const port = 8001;
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './src/views/');

const tolemshot_rus_router = require('./src/routes/router');
const avr_rus_router = require('./src/routes/avr');
const avr_rus_scan_router = require('./src/routes/avr_rus_scan');
const blank_zakazov_router = require('./src/controllers/pdfmerger.controller');

app.get('/tolemshot_rus', tolemshot_rus_router);
app.get('/avr_rus', avr_rus_router);
app.get('/avr_rus_scan', avr_rus_scan_router);
app.get('/blank_zakazov', blank_zakazov_router);

app.listen(port, () => console.log(`Port listen in  ${port}`));
