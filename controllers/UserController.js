const jwt = require('jsonwebtoken');
const sql = require('mssql');
const db = require('../dbconfig');
const moment = require('moment');

var emailRegex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
function isEmailValid(email) {
	if (!email)
			return false;

	if(email.length>254)
			return false;

	var valid = emailRegex.test(email);
	if(!valid)
			return false;

	// Further checking of some things regex can't handle
	var parts = email.split("@");
	if(parts[0].length>64)
			return false;

	var domainParts = parts[1].split(".");
	if(domainParts.some(function(part) { return part.length>63; }))
			return false;

	return true;
}

module.exports = {
	validateApiToken(req, res, next) {
		if (req.session.API_TOKEN === undefined) {
			res.status(301).redirect("/login");
		} else {
			next();
		}
	},
	async updateSettings(req, res) {
		if (req.session.API_TOKEN === undefined) {
			res.status(403).send({ data: { status: 403, message: "Error: Forbidden." }});
		}
		if (parseInt(req.params.settingsId) > 2 || parseInt(req.params.settingsId) < 1)
			res.status(403).send({ data: { status: 403, message: "Error: Forbidden." }});
			
		let custId = 0;
		jwt.verify(req.session.API_TOKEN, `${process.env.SESSION_SECRET}`, function(err, data) {
			custId = data.userId;
		});
		if (parseInt(req.params.settingsId) === 1) {
			const address = `${req.body.address}`;
			const city = `${req.body.city}`;
			const state = `${req.body.state}`;
			const postalCode = `${req.body.postalCode}`;
			const country = `${req.body.country}`;
			if (address.length < 5)
				res.status(401).send({ data: { status: 401, message: "Error: Street must be longer than 5 letters." }});
				
			if (city.length < 4)
				res.status(401).send({ data: { status: 401, message: "Error: City must be longer than 4 letters." }});

			if (state.length < 2)
				res.status(401).send({ data: { status: 401, message: "Error: State must be longer than 1 letter." }});
			
			if (postalCode.length < 4 || country.length < 4)
				res.status(401).send({ data: { status: 401, message: "Error: Postal Code and Country must be longer than 3 letters." }});

			res.status(200).send({ data: { status: 200, message: "Success: Information updated." }});
		} else { 
			const oldPassword = `${req.body.oldPassword}`;
			const newPassword = `${req.body.newPassword}`;

			if (oldPassword.length < 2 || newPassword.length < 2)
				res.status(401).send({ data: { status: 401, message: "Error: Old and New passwords must be longer than 1 letter." }});

			await sql.connect(db.sqlConfig).then(pool => {
				return pool.request()
						.input('id', sql.Int, custId)
						.query('SELECT password FROM customer WHERE customerId = @id');
			}).then(result => {
				if (result.recordset[0].password !== oldPassword)
					res.status(401).send({ data: { status: 401, message: "Error: Old password is incorrect." }});
				else {
					sql.connect(db.sqlConfig).then(pool => {
						return pool.request()
								.input('id', sql.Int, custId)
								.input('password', sql.VarChar, newPassword)
								.query('UPDATE customer SET password = @password WHERE customerId = @id');
					}).catch(err => {
						console.log(err);
					});
		
					res.status(200).send({ data: { status: 200, message: "Success: Information updated." }});
				}
			}).catch(err => {
				console.log(err);
			});
		}
	},
	async getUser(req, res) {
		const user = {
			custId: 2,
			firstName: `Bobby`,
			lastName: `Brown`,
			email: `bobby.brown@hotmail.ca`,
			phonenum: `572-342-89-11`,
			address: `222 Bush Avenue, Boston, MA, 22222, United States`,
			id: `bobby`
		};
		res.status(200).render('accountPage', { title: 'My account', user: user });
	},
	async authUser(req, res, next) {

		if (req.session.API_TOKEN !== undefined) {
			res.status(401).send({ data: { status: 403, message: "Error: Forbidden." }});
		}
		const email = req.body.email;
		const password = req.body.password;

		if (!isEmailValid(email))
			res.status(401).send({ data: { status: 403, message: "Error: Email is not valid." }});
		if (!password || password.length < 1)
			res.status(401).send({ data: { status: 403, message: "Error: Password is not valid." }});

		await sql.connect(db.sqlConfig).then(pool => {
				return pool.request()
						.input('email', sql.VarChar, email)
						.query('select * from customer where email = @email');
		}).then(result => {
			if (result.recordset.length == 0)
				res.status(401).send({ data: { status: 403, message: "Error: Account doesn't exist." }});
			else {
				if (result.recordset[0].password !== password)
					res.status(401).send({ data: { status: 403, message: "Error: Password is not valid."}});

				const token = jwt.sign({ userId: result.recordset[0].customerId }, `${process.env.SESSION_SECRET}`, {
					expiresIn: '7d',
				});
				req.session.API_TOKEN = token;

				let credentials = {
					firstName: result.recordset[0].firstName,
					lastName: `${(result.recordset[0].lastName).substr(0, 1)}.`,
					isAdmin: result.recordset[0].isAdmin,
					isAuthAdmin: false
				};
				req.session.API_TOKEN = token;
				req.session.isAuth = true;
				req.session.userCredentials = credentials;
				next();
			}
		}).catch(err => {
			console.log(err);
		});
	},
	async getOrders(req, res) {
		let custId = 0;
		let orders = {}
		jwt.verify(req.session.API_TOKEN, `${process.env.SESSION_SECRET}`, function(err, data) {
			custId = data.userId;
		});
		await sql.connect(db).then(pool => {
			return pool.request()
						.input('user', sql.Int, custId)
						.query`SELECT orderproduct.orderId, orderDate,
			totalAmount, orderproduct.productId, quantity, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry, product.productName FROM ordersummary
			JOIN orderproduct ON orderproduct.orderId = ordersummary.orderId JOIN product ON product.productId = orderproduct.productId WHERE ordersummary.customerId = @user AND shiptoAddress IS NOT NULL AND shiptoCity IS NOT NULL AND shiptoState IS NOT NULL AND shiptoPostalCode IS NOT NULL AND shiptoCountry IS NOT NULL ORDER BY orderDate DESC`
		}).then(result => {
			if (result.recordsets[0] !== undefined) {
				for(var i = 0; i < result.rowsAffected; i++) {
					if (orders[moment(result.recordsets[0][i].orderDate).format('YYYY-MM-DD HH:mm')] === undefined) {
						orders[moment(result.recordsets[0][i].orderDate).format('YYYY-MM-DD HH:mm')] = {
							orderId: result.recordsets[0][i].orderId,
							orderDate: moment(result.recordsets[0][i].orderDate).format('YYYY-MM-DD HH:mm'),
							address: `${result.recordsets[0][i].shiptoAddress}, ${result.recordsets[0][i].shiptoCity}, ${result.recordsets[0][i].shiptoState}, ${result.recordsets[0][i].shiptoPostalCode}, ${result.recordsets[0][i].shiptoCountry}`,
							totalAmount: (result.recordsets[0][i].totalAmount).toFixed(2),
							products: {}
						};
						orders[moment(result.recordsets[0][i].orderDate).format('YYYY-MM-DD HH:mm')].products[result.recordsets[0][i].productId] = {
							quantity: result.recordsets[0][i].quantity,
							productName: result.recordsets[0][i].productName
						};
					} else {
						orders[moment(result.recordsets[0][i].orderDate).format('YYYY-MM-DD HH:mm')].products[result.recordsets[0][i].productId] = {
							quantity: result.recordsets[0][i].quantity,
							productName: result.recordsets[0][i].productName
						};
					}	
				}
			}
		}).catch(err => {
			console.log(err);
		});
		res.status(200).render('accountOrdersPage', { title: 'Account Orders', orders: orders });
	},
	async getUserSettings(req, res) {
		let custId = 0;
		let user = {}
		jwt.verify(req.session.API_TOKEN, `${process.env.SESSION_SECRET}`, function(err, data) {
			custId = data.userId;
		});
		await sql.connect(db.sqlConfig).then(pool => {
			return pool.request()
					.input('id', sql.Int, custId)
					.query('SELECT address, city, state, postalCode, country FROM customer WHERE customerId = @id');
		}).then(result => {

			user = {
				address: result.recordset[0].address,
				city: result.recordset[0].city,
				state: result.recordset[0].state,
				postalCode: result.recordset[0].postalCode,
				country: result.recordset[0].country
			};
			res.status(200).render('accountSettingsPage', { title: 'Account Settings', user: user });
		}).catch(err => {
			console.log(err);
		});
	},
	async fetchCart(req, res) {
		let custId = 0;
		
		jwt.verify(req.session.API_TOKEN, `${process.env.SESSION_SECRET}`, function(err, data) {
			custId = data.userId;
		});
		
		if (req.session.productList === undefined || (Object.keys(req.session.productList).length === 0)) {
			products = req.session.productList;
			await sql.connect(db.sqlConfig).then(pool => {
				return pool.request()
						.input('id', sql.Int, parseInt(custId))
						.query('SELECT TOP 1 orderId FROM ordersummary WHERE customerId = @id AND shiptoAddress IS NULL AND shiptoCity IS NULL AND shiptoState IS NULL AND shiptoPostalCode IS NULL AND shiptoCountry IS NULL ORDER BY orderDate DESC');
			}).then(result => {
				if (result.recordset[0] !== undefined) {
					sql.connect(db.sqlConfig).then(pool => {
						return pool.request()
								.input('orderId', sql.Int, result.recordset[0].orderId)
								.query('SELECT incart.productId, incart.quantity, incart.price, product.productName FROM incart JOIN product ON incart.productId = product.productId WHERE incart.orderId = @orderId');
					}).then(result => {
						
						for (var i = 0; i < result.rowsAffected; i++) {
							products[result.recordsets[0][i].productId] = {
								title: result.recordsets[0][i].productName, price: (result.recordsets[0][i].price).toFixed(2), quantity: result.recordsets[0][i].quantity, totalPrice: (result.recordsets[0][i].price * result.recordsets[0][i].quantity).toFixed(2)
							};
						}
						res.status(200).send({ data: { status: 200 }});
					}).catch(err => {
						console.log(err);
						res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
					});
				} else {
					res.status(200).send({ data: { status: 200 }});
				}
				
			}).catch(err => {
				console.log(err);
				res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
			});
		} else {
			await sql.connect(db.sqlConfig).then(pool => {
				return pool.request()
						.input('id', sql.Int, parseInt(custId))
						.query('SELECT TOP 1 orderId FROM ordersummary WHERE customerId = @id AND shiptoAddress IS NULL AND shiptoCity IS NULL AND shiptoState IS NULL AND shiptoPostalCode IS NULL AND shiptoCountry IS NULL ORDER BY orderDate DESC');
			}).then(result => {
				let orderId = 0;

				if (result.rowsAffected !== 0 && result.recordset[0] !== undefined) {
					orderId = result.recordset[0].orderId;
				}	else {
					const date = moment().format('YYYY-MM-DD HH:mm:ss.S');
					sql.connect(db.sqlConfig).then(pool => {
						return pool.request()
								.input('custId', sql.Int, custId)
								.input('date', sql.DateTime, date)
								.query('INSERT INTO ordersummary(customerId, orderDate, totalAmount) VALUES(@custId, @date, 0); SELECT SCOPE_IDENTITY() AS id;');
					}).then(result => {
						orderId = parseInt(result.recordset[0].id);
					}).catch(err => {
						console.log(err);
						res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
					});
				}
				Object.keys(req.session.productList).forEach(key => {
					
					sql.connect(db.sqlConfig).then(pool => {
						return pool.request()
								.input('orderId', sql.Int, parseInt(orderId))
								.input('prodId', sql.Int, parseInt(key))
								.query('SELECT * FROM incart WHERE orderId = @orderId AND productId = @prodId');
					}).then(result => {
						let prodPrice = parseFloat(req.session.productList[key].price);
						if(result.recordset[0] === undefined) {
							sql.connect(db.sqlConfig).then(pool => {
								return pool.request()
										.input('orderId', sql.Int, orderId)
										.input('prodId', sql.Int, parseInt(key))
										.input('prodPrice', sql.Decimal, prodPrice)
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
										.input('prodId', sql.Int, parseInt(key))
										.query('UPDATE incart SET quantity = quantity + 1 WHERE orderId = @orderId AND productId = @prodId');
							}).then(result => {
							}).catch(err => {
								console.log(err);
								res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
							});
						}
						sql.connect(db.sqlConfig).then(pool => {
							return pool.request()
									.input('orderId', sql.Int, orderId)
									.input('prodPrice', sql.Decimal, prodPrice)
									.query('UPDATE orderSummary SET totalAmount = totalAmount + @prodPrice WHERE orderId = @orderId');
						}).then(result => {
						}).catch(err => {
							console.log(err);
							res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
						});

					}).catch(err => {
						console.log(err);
						res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
					});

				});	
				let products = req.session.productList;
				
				sql.connect(db.sqlConfig).then(pool => {
					return pool.request()
							.input('orderId', sql.Int, orderId)
							.query('SELECT incart.productId, incart.quantity, incart.price, product.productName FROM incart JOIN product ON incart.productId = product.productId WHERE incart.orderId = @orderId');
				}).then(result => {
					for (var i = 0; i < result.rowsAffected; i++) {
						if (products[result.recordsets[0][i].productId] === undefined)
							products[result.recordsets[0][i].productId] = {title: result.recordsets[0][i].productName, price: (result.recordsets[0][i].price).toFixed(2), quantity: result.recordsets[0][i].quantity, totalPrice: (result.recordsets[0][i].price * result.recordsets[0][i].quantity).toFixed(2)};
						else {
							products[result.recordsets[0][i].productId].quantity = products[result.recordsets[0][i].productId].quantity + result.recordsets[0][i].quantity; 
							products[result.recordsets[0][i].productId].totalPrice = (parseFloat(products[result.recordsets[0][i].productId].totalPrice) + (result.recordsets[0][i].price * result.recordsets[0][i].quantity)).toFixed(2);
						}
					}
					res.status(200).send({ data: { status: 200 }});
				}).catch(err => {
					console.log(err);
					res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
				});
				
			}).catch(err => {
				console.log(err);
				res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
			});
		}
		
	}
};
