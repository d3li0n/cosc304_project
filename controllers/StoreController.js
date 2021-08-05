const sql = require('mssql');
const db = require('../dbconfig');

module.exports = {
	async getAllCategories(req, res, next) {
		if (req.session.Categories === undefined) {
			await sql.connect(db).then(() => {
				return sql.query`select categoryName from category`
			}).then(result => {
				let categoryList = [];
				for (var i = 0; i < result.recordset.length; i++) {
					categoryList.push(result.recordset[i].categoryName);
				}
				req.session.Categories = categoryList;
				next();
			}).catch(err => {
				console.log(err);
			});
		}
		await next();
	}
};