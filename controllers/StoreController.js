const sql = require('mssql');
const db = require('../dbconfig');

module.exports = {

	async getProducts(req, res,next) {
		const search = req.query.search;
		const category = req.query.category;
		let categories = [];
		await sql.connect(db.sqlConfig).then(pool => {
			return sql.query` Select categoryName From category`
		}).then(result => {
			for (var i=0;i<result.rowsAffected;i++){
				categories[i]=result.recordset[i].categoryName;
			}
		}).catch(err => {
			console.log(err);
			res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
		});
	
		const productsList = {
		
		};
		if(search===undefined && category=== undefined){
			await sql.connect(db.sqlConfig).then(pool => {
				return sql.query` Select productId, productImageURL, productName, productPrice, categoryName From product join category on category.categoryId=product.categoryId`
			}).then(result => {
				for (var i=0;i<result.rowsAffected;i++){
					const price= (result.recordset[i].productPrice).toFixed(2);
					productsList[result.recordset[i].productId]={imgUrl:result.recordset[i].productImageURL,title:result.recordset[i].productName,price:price,category:result.recordset[i].categoryName };
				}
			}).catch(err => {
				console.log(err);
				res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
			});
		} else if (search!==undefined && category===undefined){
			await sql.connect(db.sqlConfig).then(pool => {
				return pool.request()
				.input('searchId', sql.VarChar, '%'+search+'%')
				.query("Select productId, productImageURL, productName, productPrice, categoryName From product join category on category.categoryId=product.categoryId Where productName Like @searchId");
			}).then(result => {
				for (var i=0;i<result.rowsAffected;i++){
					const price= (result.recordset[i].productPrice).toFixed(2);
					productsList[result.recordset[i].productId]={imgUrl:result.recordset[i].productImageURL,title:result.recordset[i].productName,price:price,category:result.recordset[i].categoryName };
				}
			}).catch(err => {
				console.log(err);
				res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
			});
		}  else if (search===undefined && category!==undefined){
			await sql.connect(db.sqlConfig).then(pool => {
				return pool.request()
				.input('categoryId', sql.VarChar, '%'+category+'%')
				.query("Select productId, productImageURL, productName, productPrice, categoryName From product join category on category.categoryId=product.categoryId Where categoryName Like @categoryId");
			}).then(result => {
				for (var i=0;i<result.rowsAffected;i++){
					const price= (result.recordset[i].productPrice).toFixed(2);
					productsList[result.recordset[i].productId]={imgUrl:result.recordset[i].productImageURL,title:result.recordset[i].productName,price:price,category:result.recordset[i].categoryName };
				}
			}).catch(err => {
				console.log(err);
				res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
			});
		}else {
			await sql.connect(db.sqlConfig).then(pool => {
				return pool.request()
				.input('categoryId', sql.VarChar, '%'+category+'%')
				.input('searchId', sql.VarChar, '%'+search+'%')
				.query("Select productId, productImageURL, productName, productPrice, categoryName From product join category on category.categoryId=product.categoryId Where categoryName Like @categoryId AND productName Like @searchId");
			}).then(result => {
				for (var i=0;i<result.rowsAffected;i++){
					const price= (result.recordset[i].productPrice).toFixed(2);
					productsList[result.recordset[i].productId]={imgUrl:result.recordset[i].productImageURL,title:result.recordset[i].productName,price:price,category:result.recordset[i].categoryName };
				}
			}).catch(err => {
				console.log(err);
				res.status(403).send({ data: { status: 403, message: "Error: Invalid Statement."}});
			});
		}
		const prodLengthBool = (Object.keys(productsList).length) ? true : false;
		res.status(200).render('store', { title: 'Store',
																			categoriesList: categories, 
																			isEmptyList: prodLengthBool, 
																			products: productsList });
	}
}

