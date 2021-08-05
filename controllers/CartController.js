module.exports = {

	/*
		SELECT TOP 1 orderId FROM [dbo].[ordersummary] 
WHERE customerId = 2 AND shiptoAddress IS NULL AND shiptoCity IS NULL AND shiptoState IS NULL AND shiptoPostalCode IS NULL AND shiptoCountry IS NULL 
ORDER BY orderDate DESC; 
	*/
	loadCart(req, res, next) {
		if (req.session.productList === undefined) {
			req.session.productList = [];
			req.session.productListPrice = (0).toFixed(2);
		}
		next();
	},
	cartCheckout(session) {
		var cart = null;
		if (session.productsList === undefined) {
			cart = {
				title: "Oops, you can't do that 😥",
				description: "Your cart is empty, and we can't process your order.",
				link: "/store",
				linkMessage: "Continue Shopping"
			};
		} else if (session.API_TOKEN === undefined) {
			cart = {
				title: "Oops, you can't do that 😥",
				description: "You need to Log In to your account to checkout your cart.",
				link: "/login",
				linkMessage: "Login"
			};
		} else {
			cart = {
				title: "Success 😄",
				description: "Your order is successfully placed!<br/> You will receive your confirmation email shortly.",
				link: "/store",
				linkMessage: "Continue Shopping"
			}
		};
		return cart;
	},
}