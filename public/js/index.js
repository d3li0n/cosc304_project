$(document).ready(function () {

	if (window.location.pathname === '/store') {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('search') && urlParams.has('category')) {
			$(".search-store-title").text(`Search for product '${urlParams.get('search')}' and category '${urlParams.get('category')}'.`);
			$(".search-store-title").show();
		} else if (urlParams.has('search') && !urlParams.has('category')) {
			$(".search-store-title").text(`Search for product '${urlParams.get('search')}'.`);
			$(".search-store-title").show();
		} else if (!urlParams.has('search') && urlParams.has('category')) {
			$(".search-store-title").text(`Search for category '${urlParams.get('category')}'.`);
			$(".search-store-title").show();
		} else {
			$(".search-store-title").hide();
		}
	}

	$(".category-store-link").click(function(e) {
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('search') && urlParams.get('search').length > 0) {
			window.location.href = `/store?search=${urlParams.get('search')}&category=${$(this).text()}`;
		} else {
			window.location.href = `/store?category=${$(this).text()}`;
		}
	});

	$("#shopSearchBtn").keyup(function (e) {
		if (e.keyCode == 13) {
			const urlParams = new URLSearchParams(window.location.search);
			if (urlParams.has('category') && urlParams.get('category').length > 0) {
				window.location.href = `/store?search=${$(this).val()}&category=${urlParams.get('category')}`;
			} else {
				window.location.href = `/store?search=${$(this).val()}`;
			}
		}
	});

	$('.fa-search').click(function(e) {  
    const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('category') && urlParams.get('category').length > 0) {
			window.location.href = `/store?search=${$(this).val()}&category=${urlParams.get('category')}`;
		} else {
			window.location.href = `/store?search=${$(this).val()}`;
		}
	});

	$(".btnLogin").click(function(){
		$.ajax({
			type: "POST",
			url: '/login',
			dataType: 'application/json',
			data: {
        email: $("#email").val(),
        password: $("#password").val(),
    	},
			success: function (response) {
			}, error: function (err) {
				let response = JSON.parse(err.responseText);

				if (parseInt(response.data.status) === 403) {
					$(".log-err").text(response.data.message);
					$(".log-err").css("display", "block");
				} else {
					window.location.href = "/";
				}
			}
		});
	});

	$('.shop-btn-add-cart').click(function(e) {
		const prodId = $(this).attr('data-prodId');
		$.ajax({
			type: "POST",
			url: `/product/${prodId}/addCart`,
			dataType: 'application/json',
			success: function (response) {
			}, error: function (err) {
				let response = JSON.parse(err.responseText);

				if (parseInt(response.data.status) === 403) {
					console.log('error detected');
				} else {
					window.location.href = "/cart";
				}
			}
		});
	});

	$('.logoutHeader').click(function(e) {  
		$.ajax({
			type: "POST",
			url: '/logout',
			dataType: 'application/json',
			success: function (response) {
			}, error: function (err) {
				let response = JSON.parse(err.responseText);

				if (parseInt(response.data.status) === 403) {
					$(".log-err").text(response.data.message);
					$(".log-err").css("display", "block");
				} else {
					window.location.href = "/";
				}
			}
		});
	});
	$(".img-product-sm").click(function(e) {
		$(".img-store-lx").attr('src', `${$(".img-product-sm").attr('src')}`);
	})
	$(".img-product-sm-secondary").click(function(e) {
		$(".img-store-lx").attr('src', `${$(".img-product-sm-secondary").attr('src')}`);
	})
});
