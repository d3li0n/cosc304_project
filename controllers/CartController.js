const sql = require('mssql');
const db = require('../dbconfig');
const jwt = require('jsonwebtoken');
module.exports = {
	loadCart(req, res, next) {
		
		if (req.session.productList === undefined || (Object.keys(req.session.productList).length === 0)) {
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
	async cartCheckout(req, res) {
		var cart = null;
		if (req.session.productList === undefined || (Object.keys(req.session.productList).length === 0)) {
			cart = {
				title: "Oops, you can't do that 😥",
				description: "Your cart is empty, and we can't process your order.",
				link: "/store",
				linkMessage: "Continue Shopping"
			};
		} else if (req.session.API_TOKEN === undefined) {
			cart = {
				title: "Oops, you can't do that 😥",
				description: "You need to Log In to your account to checkout your cart.",
				link: "/login",
				linkMessage: "Login"
			};
		} else {
			let orderId = 0;
			let custId = 0;
			jwt.verify(req.session.API_TOKEN, `${process.env.SESSION_SECRET}`, function(err, data) {
				custId = data.userId;
			});
			
			await sql.connect(db).then(pool => {				
				return pool.request()
					.input('custId', sql.Int, custId)
					.query(`SELECT TOP 1 orderId FROM ordersummary WHERE customerId = @custId AND shiptoAddress IS NULL AND shiptoCity IS NULL AND shiptoState IS NULL AND shiptoPostalCode IS NULL AND shiptoCountry IS NULL ORDER BY orderDate DESC`);
			}).then(result => {
				orderId = parseInt(result.recordset[0].orderId);
				sql.connect(db.sqlConfig).then(pool => {
					return pool.request()
							.input('orderId', sql.Int, orderId)							
							.query('SELECT * FROM incart WHERE orderId = @orderId');
				}).then(result => {		
								
					for(var i = 0; i < result.rowsAffected; i++) {
						let productId =  result.recordsets[0][i].productId;
						let prodPrice = (result.recordsets[0][i].price).toFixed(2);
						let quantity =  (result.recordsets[0][i].quantity);
						sql.connect(db.sqlConfig).then(pool => {							
							return pool.request()
								.input('orderId', sql.Int, orderId)
								.input('prodId', sql.Int, productId)
								.input('quantity', sql.Int, quantity)
								.input('prodPrice', sql.Decimal, prodPrice)
								.query('INSERT INTO orderproduct VALUES(@orderId, @prodId, @quantity, @prodPrice)');	
						}).catch(err => {
							console.log(err);
						});					
					}											
				}).catch(err => {
					console.log(err);
				});
			}).catch(err => {
				console.log(err);
			});

			await sql.connect(db).then(pool => {
				return pool.request()
					.input('custId', sql.Int, custId)
					.query('SELECT address, city, state, postalCode, country FROM customer WHERE customerId = @custId');
			}).then(result =>{
				let custAddress = result.recordset[0].address;
				let custCity = result.recordset[0].city;
				let custState = result.recordset[0].state;
				let custPO = result.recordset[0].postalCode;
				let custCountry = result.recordset[0].country;
				sql.connect(db).then(pool => {
					return pool.request()
						.input('address',sql.VarChar,custAddress)
						.input('city',sql.VarChar,custCity)
						.input('state',sql.VarChar,custState)
						.input('postalCode',sql.VarChar,custPO)
						.input('country',sql.VarChar,custCountry)
						.input('orderId',sql.VarChar,orderId)
						.input('custId',sql.VarChar,custId)
						.query('UPDATE ordersummary SET shiptoAddress= @address, shiptoCity= @city, shiptoState = @state, shiptoPostalCode = @postalCode, shiptoCountry = @country WHERE orderId = @orderId AND customerId = @custId');
				}).catch(err => {
					console.log(err);
				});
			}).catch(err => {
				console.log(err);
			});
			req.session.productList = {};

			cart = {
				title: "Success 😄",
				description: `Your order is successfully placed! You will receive your confirmation email shortly. Order #${orderId}, Customer #${custId}`,
				link: "/store",
				linkMessage: "Continue Shopping"
			}
		}
		res.status(200).render('cartCheckout', { title: 'Checkout', response: cart });
	},
}