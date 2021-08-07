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
			res.status(301).redirect("/"); //temp
		}
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

				const token = jwt.sign({ userId: result.recordset[0].customerId, isAdmin: false }, `${process.env.SESSION_SECRET}`, {
					expiresIn: '7d',
				});
				req.session.API_TOKEN = token;

				let credentials = {
					firstName: result.recordset[0].firstName,
					lastName: `${(result.recordset[0].lastName).substr(0, 1)}.`
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

	async fetchCart(req, res) {
		let custId = 0;
		
		jwt.verify(req.session.API_TOKEN, `${process.env.SESSION_SECRET}`, function(err, data) {
			custId = data.userId;
		});
		
		if (req.session.productList === undefined || (Object.keys(req.session.productList).length === 0)) {
			products = req.session.productList;
			console.log('detected an empty cart on login');
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
			console.log('detected not empty on cart');
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
