const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).render('index', { title: '' });
});

router.get('/store', (req, res) => {
	// listprod.js
});

router.get('/cart', (req, res) => {
	// showcart.js
});

router.get('/checkout', (req, res) => {
	// checkout.js
});

router.post('/checkout/order', (req, res) => {
	// order.js
});

router.get('/product/:id', (req, res) => {
	// listprod.js
});

router.post('/product/:id/addCart', (req, res) => {
	// addcart.js
});

router.get('*', (req, res) => {
	res.status(404).render('index', { title: 'Page Not Found' });
});

module.exports = router;