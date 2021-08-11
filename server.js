require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const router = require('./routes');
const dbConnection = require('./dbconfig');
const handlebars = require('express-handlebars');
const cartController = require('./controllers/CartController');

const sessions = require('express-session');
const cookieParser = require("cookie-parser");

// backend setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'/public/')));
app.use(cookieParser());

app.use('*/css',express.static('public/css'));
app.use('*/js',express.static('public/js'));
app.use('*/images',express.static('public/images'));

//session middleware
app.use(sessions({ secret: `${process.env.SESSION_SECRET}`, cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, saveUninitialized: true,  resave: true }));

app.use(function (req, res, next) { res.locals.session = req.session; next(); });

app.use(cartController.loadCart);
// Use .handlebars as front-end view
app.engine('handlebars', handlebars({ layoutsDir: __dirname + '/views/layouts/', partialsDir: __dirname + '/views/partials/' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.handlebars');
// Keep all routes in separate file
app.use('/', router);
// Listen Server on specific port
app.listen(process.env.PORT || port, () => console.log(`Listening app on port: ${port}`));
dbConnection.testConnection();