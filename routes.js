const express = require('express');
const router = express.Router();
const cartController = require('./controllers/CartController');
const userController = require('./controllers/UserController');
const storeController = require('./controllers/StoreController');
const adminController = require('./controllers/AdminController');
const productController = require('./controllers/ProductController');
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

router.get('/product/:id', productController.getProductInfo);

router.get('/account', userController.validateApiToken, userController.getUser);

router.use('/account/*', userController.validateApiToken);

router.get('/account/settings', userController.getUserSettings);
router.put('/account/settings/:settingsId/edit', userController.updateSettings);

router.get('/account/orders', userController.getOrders);

router.get('/register', userController.registerLoad);
router.post('/register', userController.register);

router.get('/restore', userController.restoreLoad);
router.post('/restore', userController.restoreCreate);
router.get('/restore/:token', userController.restoreLoadForm);
router.put('/restore/:token', userController.restoreConfirm);

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

router.use('/admin/*', adminController.auth);

router.get('/admin', adminController.auth, (req, res) => {
	res.status(200).render('admin', { title: 'Admin Portal' });
});

router.post('/a/login', adminController.validate);

router.get('/admin/sales', adminController.loadSales);

router.get('/admin/connection', adminController.loadDbData);

router.get('/admin/users', adminController.loadUsers);

router.get('/admin/shipments', adminController.loadShipments);

router.get('/admin/shipments/:id', adminController.loadShipment);

router.post('/admin/ship/:id', adminController.ship);

router.get('/admin/orders', adminController.loadOrders );

router.get('/admin/products', (req, res) => {
});

router.get('*', (req, res) => {
	res.status(404).render('error', { title: 'Page Not Found' });
});

module.exports = router;