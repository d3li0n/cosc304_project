const jwt = require('jsonwebtoken');
const sql = require('mssql');
const db = require('../dbconfig');

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
		if (!password || password.length < 5)
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
				res.status(200).send({ data: { status: 200/*, message: credentials */ }});
			}
		}).catch(err => {
			console.log(err);
		});
	}
};
