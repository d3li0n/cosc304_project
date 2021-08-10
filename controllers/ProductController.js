const sql = require('mssql');
const db = require('../dbconfig');
const { addProduct } = require('./CartController');
module.exports = {

    async displayProduct(req, res) {
        let productId = req.query.id;
        let products = req.session.productList;
        await sql.connect(db.sqlConfig).then(pool => {
            return pool.request()
   
                    .input('pid', sql.Int, productId)
                    .query(`SELECT reviewRating, enteredName, reviewComment, CONVERT(varchar, reviewDate, 23) as date FROM review WHERE productId = @pid`);

                }).then(result => {

                    const prodName = result.recordset[0].productName;
                    const prodPrice = result.recordset[0].productPrice;
                    if (products[prodId] === undefined)
                        products[prodId] = {title: prodName, price: (prodPrice).toFixed(2), quantity: 1, totalPrice: (prodPrice).toFixed(2)};
                    else {
                        products[prodId].quantity = products[prodId].quantity + 1;
                        products[prodId].totalPrice = (parseFloat(products[prodId].totalPrice) + prodPrice).toFixed(2);
                   } }).catch(err => {
                        res.status(403).send({ data: { status: 403, message: "Error: Invalid Product id."}});
                    })  
}
}