const express = require('express');
const router = express.Router();
const cartController = require('./controllers/CartController');
const userController = require('./controllers/UserController');
const storeController = require('./controllers/StoreController');
const adminOrderController = require('./controllers/AdminOrderController');

router.get('/', (req, res) => {
	res.status(200).render('index', { title: 'Home' });
});

router.get('/store', storeController.getProducts);


router.get('/cart', (req, res) => {
	// showcart.js
	let t = 0;
	let shipTotal = 0;
	let subTotal = 0;

	if (req.session.productList !== undefined && Object.keys(req.session.productList).length !== 0) {
		Object.keys(req.session.productList).forEach(key => {
			t += parseFloat(req.session.productList[key].totalPrice);
		});	
		shipTotal = (t*0.10);
		subTotal = (t+shipTotal);
		t = t.toFixed(2);
		shipTotal = shipTotal.toFixed(2);
		subTotal = subTotal.toFixed(2);
	}

	let totalArray = {total:t, shipTotal: shipTotal, subTotal: subTotal};
	
	res.status(200).render('cart', { title: 'My Cart', isCart: (req.session.productList !== undefined && Object.keys(req.session.productList).length !== 0) ? true : false , tArray: totalArray});
});

router.get('/cart/checkout', cartController.cartCheckout);

router.post('/product/:id/addCart', cartController.addProduct);

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

router.post('/login', userController.authUser, userController.fetchCart);

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

router.get('/admin/orders', adminOrderController.loadOrders );

router.get('/admin/products', (req, res) => {
});

router.get('/admin', (req, res) => {
	res.status(200).render('admin', { title: 'Admin Portal' });
});

router.get('*', (req, res) => {
	res.status(404).render('error', { title: 'Page Not Found' });
});

module.exports = router;