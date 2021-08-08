const sql = require('mssql');
const db = require('../dbconfig');
const moment = require('moment');
const fs = require('fs');

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
	async validate(req, res, next) {
		if (req.session.API_TOKEN === undefined || req.session.userCredentials === undefined || !req.session.userCredentials.isAdmin) {
			res.status(401).send({ data: { status: 403, message: "Error: Forbidden." }});
		} else {
			const email = req.body.email;
			const password = req.body.password;

			if (!isEmailValid(email))
				res.status(401).send({ data: { status: 403, message: "Error: Email is not valid." }});
			else if (!password || password.length < 1)
				res.status(401).send({ data: { status: 403, message: "Error: Password is not valid." }});
			else {
				await sql.connect(db.sqlConfig).then(pool => {
						return pool.request()
								.input('email', sql.VarChar, email)
								.query('select * from customer where email = @email');
				}).then(result => {
					if (result.rowsAffected[0] === 0)
						res.status(401).send({ data: { status: 403, message: "Error: Account doesn't exist." }});
					else {
						if (result.recordset[0].password !== password)
							res.status(401).send({ data: { status: 403, message: "Error: Password is not valid."}});
						else {
							let credentials = {
								firstName: result.recordset[0].firstName,
								lastName: `${(result.recordset[0].lastName).substr(0, 1)}.`,
								isAdmin: result.recordset[0].isAdmin,
								isAuthAdmin: true
							};
							req.session.userCredentials = credentials;
							res.status(200).send({ data: { status: 200 }});
						}
					}
				}).catch(err => {
					console.log(err);
				});
			}
		}
	},
	async auth(req, res, next) {
		if (req.session.API_TOKEN === undefined || req.session.userCredentials === undefined || !req.session.userCredentials.isAdmin) {
			res.status(404).render('error', { title: 'Page Not Found' });
		} else if (req.session.API_TOKEN !== undefined && req.session.userCredentials !== undefined && !req.session.userCredentials.isAuthAdmin) {
			res.status(200).render('adminLoginPage', { title: 'Admin Login' });
		} else {
			next();
		}
	},
	async loadDbData(req, res) {
		let result = {};
		try {
			await sql.connect(db.sqlConfig);

			let data = fs.readFileSync("./data/data.ddl", { encoding: 'utf8' });
			let commands = data.split(";");
			let queryres = {};
			for (let i = 0; i < commands.length; i++) {
					let command = commands[i];
					let result = await sql.query(command);
					queryres[i] = result;
			}
			result = { status: 200, response: true, query: queryres };
		} catch (err) {
			result = { status: 500, response: false };
			console.log(err)
		}
		res.status(200).render('databaseAdminPage', { title: 'Load Data', result: result });
	},
	async loadOrders(req, res) {
		let resultArr = {};

		await sql.connect(db).then(() => {
			return sql.query`SELECT orderproduct.orderId, orderDate, ordersummary.customerId, firstName, lastName,
			totalAmount, productId, quantity, price FROM ordersummary JOIN customer ON ordersummary.customerId = customer.customerId 
			JOIN orderproduct ON orderproduct.orderId = ordersummary.orderId ORDER BY orderId`
		}).then(result => {
			if (result.recordsets[0] !== undefined) {
					for(var i = 0; i < result.rowsAffected; i++) {
						if (resultArr[result.recordsets[0][i].orderId] === undefined) {
							resultArr[result.recordsets[0][i].orderId] = {
								orderDate: moment(result.recordsets[0][i].orderDate).format('YYYY-MM-DD HH:mm:ss.S'),
								customerId: result.recordsets[0][i].customerId,
								customerName: `${result.recordsets[0][i].firstName} ${result.recordsets[0][i].lastName}`,
								totalAmount: (result.recordsets[0][i].totalAmount).toFixed(2),
								products: {}
							};
							resultArr[result.recordsets[0][i].orderId].products[result.recordsets[0][i].productId] = {
								quantity: result.recordsets[0][i].quantity,
								price: (result.recordsets[0][i].price).toFixed(2)
							};
						} else {
							resultArr[result.recordsets[0][i].orderId].products[result.recordsets[0][i].productId] = {
								quantity: result.recordsets[0][i].quantity,
								price: (result.recordsets[0][i].price).toFixed(2)
							};
						}	
				}
			}
		}).catch(err => {
			console.log(err);
		});
		const listLengthBool = (Object.keys(resultArr).length) ? true : false;
		res.status(200).render('ordersAdmin', { title: 'Orders', isEmptyList: listLengthBool, orders: resultArr });
	},
	async loadUsers(req, res) {
		let users = {};
		await sql.connect(db.sqlConfig).then(pool => {
			return sql.query`SELECT customerId, firstName, lastName, email, phonenum, address, city, state, postalCode, country, userId FROM customer`
		}).then(result => {
			for (var i=0;i<result.rowsAffected;i++){
				users[result.recordset[i].customerId] = {
					custName: `${result.recordset[i].firstName} ${result.recordset[i].lastName}`,
					email: result.recordset[i].email,
					phone: result.recordset[i].phonenum,
					address: `${result.recordset[i].address}, ${result.recordset[i].city}, ${result.recordset[i].state}, ${result.recordset[i].postalCode}, ${result.recordset[i].country}`,
					nickname: `${result.recordset[i].userId}`
				};
			}
		}).catch(err => {
			console.log(err);
			res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
		});

		const listLengthBool = (Object.keys(users).length) ? true : false;

		res.status(200).render('adminUsersPage', { title: 'Users', isEmptyList: listLengthBool, users: users });
	},
	async loadShipments(req, res) {
		let shipments = {};
		await sql.connect(db.sqlConfig).then(pool => {
			return sql.query`SELECT orderId, orderDate, ordersummary.customerId, customer.firstName, customer.lastName, totalAmount FROM ordersummary JOIN customer ON ordersummary.customerId = customer.customerId
			WHERE orderId NOT IN (SELECT shipment.orderId FROM shipment)`
		}).then(result => {
			for (var i=0;i<result.rowsAffected;i++){
				shipments[result.recordset[i].orderId] = {
					orderDate: moment(result.recordset[i].orderDate).format('YYYY-MM-DD HH:mm:ss.S'),
					customerId: result.recordset[i].customerId,
					customerName: `${result.recordset[i].firstName} ${result.recordset[i].lastName}`,
					totalAmount: (result.recordset[i].totalAmount).toFixed(2),
				};
			}
		}).catch(err => {
			console.log(err);
			res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
		});
		const listLengthBool = (Object.keys(shipments).length) ? true : false;
		res.status(200).render('adminShipmentPage', { title: 'Shipments', isEmptyList: listLengthBool, shipment: shipments });
	},
	async loadSales(req, res) {		
		let sales = {};
		await sql.connect(db.sqlConfig).then(pool => {
			return sql.query('SELECT CAST(orderDate AS DATE) as dateField, SUM(totalAmount) as tAmount, COUNT(orderId) as totalOrders FROM ordersummary GROUP BY CAST(orderDate AS DATE)');
		}).then(result => {
			for (var i=0;i<result.rowsAffected;i++){
				console.log(result.recordset[i].totalOrders);
				sales[moment(result.recordset[i].dateField).format('YYYY-MM-DD')] = {
					totalSum: (result.recordset[i].tAmount).toFixed(2),
					totalOrders: result.recordset[i].totalOrders,
				};
		}}).catch(err => {
			console.log(err);
			res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
		});

		const listLengthBool = (Object.keys(sales).length) ? true : false;
		res.status(200).render('adminSalesPage', { title: 'Sales', isEmptyList: listLengthBool, sales: sales });
	}
}