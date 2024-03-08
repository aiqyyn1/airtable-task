require('dotenv').config();
const Airtable = require('airtable');
const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require('path');
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.API_KEY,
});
const base = Airtable.base(process.env.BASE);
module.exports = {pdf, ejs, path, base}
