const express = require('express');
const router = express.Router();
const cartController = require('./controllers/CartController');
const userController = require('./controllers/UserController');
const storeController = require('./controllers/StoreController');

router.get('/', (req, res) => {
	res.status(200).render('index', { title: 'Home' });
});

//router.get('/store', (req, res) => { 
/*storeController.getProducts(req.query);
	// listprod.js
	const categories = [
		"Air", "Water", "Fire", "Earth"
	];
	const productsList = {
		1: {
			imgUrl: "fire_ash_1.jpg",
			title: "Fire Ash From Volcano",
			price: (Math.round(21.35 * 100) / 100).toFixed(2)
		},
		2: {
			imgUrl: "fire_ash_1.jpg",
			title: "Fire Ash From Volcano",
			price: (Math.round(400.50 * 100) / 100).toFixed(2)
		},

		
	};

	const prodLengthBool = (Object.keys(productsList).length) ? true : false;
	res.status(200).render('store', { title: 'Store',
																		categoriesList: categories, 
																		isEmptyList: prodLengthBool, 
																		products: productsList });
});*/

router.get('/store', storeController.getProducts);


router.get('/cart', (req, res) => {
	// showcart.js
	res.status(200).render('cart', { title: 'My Cart', isCart: (req.session.productsList) ? true : false });
});

router.get('/cart/checkout', (req, res) => {
	// checkout.js

	const cartResponse = cartController.cartCheckout(req.session);
	res.status(200).render('cartCheckout', { title: 'Checkout', response: cartResponse });
});

router.get('/product/:id', (req, res) => {
	// listprod.js
});

router.get('/account', userController.validateApiToken, (req, res) => {

});

router.get('/login', (req, res) => {
	if (req.session.API_TOKEN === undefined) {
		res.status(200).render('loginPage', { title: 'Login' }); 
	} else {
		res.status(301).redirect('/');
	}
});

router.post('/login', userController.authUser);

router.post('/logout', (req, res) => {
	if (req.session.API_TOKEN === undefined) {
		res.status(403).send({ data: { code: 403, message: "Error: Not Authorized" }});
	} else {
		req.session.destroy();
		res.status(200).send({ data: { code: 200, message: "Success." }});
	}
})

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