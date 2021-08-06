const sql = require('mssql');
const db = require('../dbconfig');
const jwt = require('jsonwebtoken');
module.exports = {
	loadCart(req, res, next) {
		if (req.session.productList === undefined) {
			req.session.productList = {};
			req.session.productListPrice = (0).toFixed(2);
		} else {
			let totalPrice = 0;
			Object.keys(req.session.productList).forEach(key => {
				totalPrice = totalPrice + parseFloat(req.session.productList[key].totalPrice);
			});
			req.session.productListPrice = (totalPrice).toFixed(2);
		}
		next();
	},
	async addProduct(req, res) {
		const prodId = parseInt(req.params.id);

		if (Number.isInteger(prodId) && prodId > 0 && req.session.productList !== undefined) {
			let products = req.session.productList;
			await sql.connect(db.sqlConfig).then(pool => {
				return pool.request()
						.input('prodId', sql.Int, prodId)
						.query('select productName, productPrice from product where productId = @prodId');
			}).then(result => {
				const prodName = result.recordset[0].productName;
				const prodPrice = result.recordset[0].productPrice;
				if (products[prodId] === undefined)
					products[prodId] = {title: prodName, price: (prodPrice).toFixed(2), quantity: 1, totalPrice: (prodPrice).toFixed(2)};
				else {
					products[prodId].quantity = products[prodId].quantity + 1;
					products[prodId].totalPrice = (parseFloat(products[prodId].totalPrice) + prodPrice).toFixed(2);
				}
			}).catch(err => {
				res.status(403).send({ data: { status: 403, message: "Error: Invalid Product id."}});
			});

			if (req.session.API_TOKEN !== undefined) {
				let custId = 0;
				jwt.verify(req.session.API_TOKEN, `${process.env.SESSION_SECRET}`, function(err, data) {
					custId = data.userId;
				});
				await sql.connect(db.sqlConfig).then(pool => {
					return pool.request()
							.input('id', sql.Int, parseInt(custId))
							.query('SELECT TOP 1 orderId FROM ordersummary WHERE customerId = @id AND shiptoAddress IS NULL AND shiptoCity IS NULL AND shiptoState IS NULL AND shiptoPostalCode IS NULL AND shiptoCountry IS NULL ORDER BY orderDate DESC');
				}).then(result => {
					if(result.recordset[0] !== undefined) {
						const orderId = parseInt(result.recordset[0].orderId);
						sql.connect(db.sqlConfig).then(pool => {
							return pool.request()
									.input('orderId', sql.Int, parseInt(result.recordset[0].orderId))
									.input('prodId', sql.Int, parseInt(prodId))
									.query('SELECT * FROM incart WHERE orderId = @orderId AND productId = @prodId');
						}).then(result => {
							if(result.recordset[0] === undefined) {
								sql.connect(db.sqlConfig).then(pool => {
									return pool.request()
											.input('orderId', sql.Int, orderId)
											.input('prodId', sql.Int, parseInt(prodId))
											.input('prodPrice', sql.Decimal, products[prodId].price)
											.query('INSERT INTO incart VALUES(@orderId, @prodId, 1, @prodPrice)');
								}).then(result => {
								}).catch(err => {
									console.log(err);
									res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
								});
							} else {
								sql.connect(db.sqlConfig).then(pool => {
									return pool.request()
											.input('orderId', sql.Int, orderId)
											.input('prodId', sql.Int, parseInt(prodId))
											.query('UPDATE incart SET quantity = quantity + 1 WHERE orderId = @orderId AND productId = @prodId');
								}).then(result => {
								}).catch(err => {
									console.log(err);
									res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
								});
							}
						}).catch(err => {
							console.log(err);
							res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
						});
						
						// update total sum
						sql.connect(db.sqlConfig).then(pool => {
							return pool.request()
									.input('orderId', sql.Int, orderId)
									.input('prodPrice', sql.Decimal, products[prodId].price)
									.query('UPDATE orderSummary SET totalAmount = totalAmount + @prodPrice WHERE orderId = @orderId');
						}).then(result => {
						}).catch(err => {
							console.log(err);
							res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
						});

					} else {
						const date = new Date();
						sql.connect(db.sqlConfig).then(pool => {
							return pool.request()
									.input('custId', sql.Int, custId)
									.input('date', sql.Date, date)
									.input('prodPrice', sql.Decimal, products[prodId].price)
									.query('INSERT INTO ordersummary(customerId, orderDate, totalAmount) VALUES(@custId, @date, @prodPrice); SELECT SCOPE_IDENTITY() AS id;');
						}).then(result => {
							sql.connect(db.sqlConfig).then(pool => {
								return pool.request()
										.input('orderId', sql.Int, parseInt(result.recordset[0].id))
										.input('prodId', sql.Int, parseInt(prodId))
										.input('prodPrice', sql.Decimal, products[prodId].price)
										.query('INSERT INTO incart VALUES(@orderId, @prodId, 1, @prodPrice)');
							}).then(result => {
							}).catch(err => {
								console.log(err);
								res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
							});


						}).catch(err => {
							console.log(err);
							res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
						});
					}
					
				}).catch(err => {
					console.log(err);
					res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
				});

			}
			res.status(200).send({ data: { status: 200 }});
		} else {
			res.status(403).send({ data: { status: 403, message: "Error: Invalid Product id."}});
		}
	},
	cartCheckout(session) {
		var cart = null;
		if (session.productsList === undefined) {
			cart = {
				title: "Oops, you can't do that 😥",
				description: "Your cart is empty, and we can't process your order.",
				link: "/store",
				linkMessage: "Continue Shopping"
			};
		} else if (session.API_TOKEN === undefined) {
			cart = {
				title: "Oops, you can't do that 😥",
				description: "You need to Log In to your account to checkout your cart.",
				link: "/login",
				linkMessage: "Login"
			};
		} else {
			cart = {
				title: "Success 😄",
				description: "Your order is successfully placed!<br/> You will receive your confirmation email shortly.",
				link: "/store",
				linkMessage: "Continue Shopping"
			}
		};
		return cart;
	},
}