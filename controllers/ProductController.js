const sql = require('mssql');
const db = require('../dbconfig');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

module.exports = {

	async displayProduct(req, res) {
		const prodId = parseInt(req.params.id);
		if (prodId < 1) {
			return res.status(301).redirect('/store');
		}
		let reviewsList = {};
		let product = {};
		await sql.connect(db.sqlConfig).then(pool => {
			return pool.request()
					.input('pid', sql.Int, prodId)
					.query(`SELECT cast(productImage as nvarchar(max)) as image, productName, productDesc, productPrice, productImageURL, categoryName from product join category on category.categoryId = product.categoryId where productId = @pid`);
		}).then(result => {
				if (result.rowsAffected[0] === 0) {
					return res.status(301).redirect('/store');
				} else {
						const file = fs.readFileSync(path.join(__dirname, `../public/images/store_images/${result.recordset[0].image}`));
						const base64String = Buffer.from(file).toString('base64');
						product = {
								productId: req.params.id,
								productTitle: `${result.recordset[0].productName}`,
								productCategory: `${result.recordset[0].categoryName}`,
								productDescription: `${result.recordset[0].productDesc}`,
								productPrice: (result.recordset[0].productPrice).toFixed(2),
								imageUrl: `${result.recordset[0].productImageURL}`,
								image: `${base64String}`,
						};
				}
		}).catch(err => {
			res.status(403).send({ data: { status: 403, message: "Error: Invalid statement."}});
		});
		await sql.connect(db.sqlConfig).then(pool => {
			return pool.request()
				.input('pid', sql.Int, prodId)
				.query(`SELECT firstName, lastName, reviewRating, reviewComment, reviewDate, reviewId FROM review join customer on customer.customerId=review.customerId WHERE productId = @pid`);
		}).then(result => {
			if (result.rowsAffected[0] !== 0) {
				for(var i =0; i < result.rowsAffected[0]; i++) {
					reviewsList[result.recordsets[0][i].reviewId] = {
						customerName: `${result.recordsets[0][i].firstName} ${result.recordsets[0][i].lastName}`,
						dateReview: moment(result.recordsets[0][i].reviewDate).format('YYYY-MM-DD'),
						review: `${result.recordsets[0][i].reviewComment}`,
						stars: []
					}
					for (var x = 0; x < result.recordsets[0][i].reviewRating; x++)
						(reviewsList[result.recordsets[0][i].reviewId].stars).push(x);
				}
			}

			return res.status(200).render('productPage', { title: 'Product', reviews: reviewsList, product: product, isEmpty: (Object.keys(reviewsList).length === 0) });
		}).catch(err => {
			console.log(err);
			res.status(403).send({ data: { status: 403, message: "Error: Invalid Product id."}});
		});
	}
}