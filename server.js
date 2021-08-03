require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const router = require('./routes');
const handlebars = require('express-handlebars');

// backend setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'/public/')));

// Use .handlebars as front-end view
app.engine('handlebars', handlebars({
	layoutsDir: __dirname + '/views/layouts/',
	partialsDir: __dirname + '/views/partials/'
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.handlebars');

// Keep all routes in separate file
app.use('/', router);

// Listen Server on specific port
app.listen(process.env.PORT || port, () => console.log(`Listening app on port: ${port}`));