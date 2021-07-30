const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).render('index', { title: 'Home' });
});

router.get('/store', (req, res) => {
	// listprod.js
	const categories = [
		"Air", "Water", "Fire", "Earth"
	];
	const prodLengthBool = false;
	res.status(200).render('store', { title: 'Store',
																		categoriesList: categories, 
																		isEmptyList: prodLengthBool, 
																		products: null });
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

router.get('/admin/users', (req, res) => {
});

router.get('/admin/orders', (req, res) => {
	// listorders.js
	const orderList = {
		// Test sample. TODO: database connection feature
		3232: {
			orderDate: '2019-12-20 13:30:30.0',
			customerId: 23,
			customerName: 'Test Test',
			totalAmount: (Math.round(91.70 * 100) / 100).toFixed(2),
			products: {
				1: {
					quantity: 1,
					price: (Math.round(18.00 * 100) / 100).toFixed(2),
				},
				5: {
					quantity: 2,
					price: (Math.round(21.35 * 100) / 100).toFixed(2),
				},
				10: {
					quantity: 1,
					price: (Math.round(31.00 * 100) / 100).toFixed(2),
				}
			}
		},
		21222: {
			orderDate: '2019-12-20 13:30:30.0',
			customerId: 23,
			customerName: 'Test Test',
			totalAmount: (Math.round(91.70 * 100) / 100).toFixed(2),
			products: {
				1: {
					quantity: 1,
					price: (Math.round(18.00 * 100) / 100).toFixed(2),
				},
				5: {
					quantity: 2,
					price: (Math.round(21.35 * 100) / 100).toFixed(2),
				},
				10: {
					quantity: 1,
					price: (Math.round(31.00 * 100) / 100).toFixed(2),
				}
			}
		}
	};
	const listLengthBool = (Object.keys(orderList).length) ? true : false;

	res.status(200).render('ordersAdmin', { title: 'Orders', isEmptyList: listLengthBool, orders: orderList });
});

router.get('/admin/products', (req, res) => {
});

router.get('/admin', (req, res) => {
	res.status(200).render('admin', { title: 'Admin Portal' });
});


router.get('*', (req, res) => {
	res.status(404).render('error', { title: 'Page Not Found' });
});

module.exports = router;