const sql = require('mssql');
const db = require('../dbconfig');
const moment = require('moment');
const fs = require('fs');
module.exports = {
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
	}
}