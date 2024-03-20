const express = require('express');
const app = express();
const port = 8001;
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './src/views/');

//create router for Tolemshot-RUS
//TODO: refactor code - rename "const router" to "const tolemshot_rus_router" 
//TODO: refactor code - rename "./src/routes/router" to "./src/routes/tolemshot_rus" 
const router = require('./src/routes/router');

//create router for AVR-RUS
//TODO: refactor code - rename "const router1" to "const avr_rus_router" 
//TODO: refactor code - rename "./src/routes/avr" to "./src/routes/avr_rus" 
const router1 = require('./src/routes/avr');

//create router for blank_zakazov
//TODO: refactor code - rename "const pdfmerger" to "const blank_zakazov_router" 
const pdfmerger = require('./src/controllers/pdfmerger.controller')

//TODO: refactor code - rename "/blanks" to "/tolemshot_rus" 
//TODO: refactor code - rename "/blanks1" to "/avr_rus" 
//TODO: refactor code - rename "/pdfmerger" to "/blank_zakazov" 
app.get('/blanks', router);
app.get('/blanks1', router1);
app.get('/pdfmerger', pdfmerger )

app.listen(port, () => console.log(`Port listen in  ${port}`));
