module.exports = {
	cartCheckout(session) {
		var cart = null;
		if (session.productsList == undefined) {
			cart = {
				title: "Oops, you can't do that 😥",
				description: "Your cart is empty, and we can't process your order.",
				link: "/store",
				linkMessage: "Continue Shopping"
			};
		} else if (session.auth == undefined) {
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