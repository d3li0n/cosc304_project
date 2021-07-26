const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const router = require('./routes');
const handlebars = require('express-handlebars');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(express.static(path.join(__dirname, "public")));
app.engine('handlebars', handlebars({
	layoutsDir: __dirname + '/views/layouts/',
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.handlebars');

// Keep all routes in separate file
app.use('/', router);

// Listen Server on specific port
app.listen(port, () => console.log(`Listening app on port: ${port}`));
