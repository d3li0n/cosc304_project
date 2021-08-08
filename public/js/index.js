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
	$(".btnLoginAdmin").click(function(){
		$.ajax({
			type: "POST",
			url: '/a/login',
			dataType: 'application/json',
			data: {
        email: $("#emailadmin").val(),
        password: $("#passwordadmin").val(),
    	},
			success: function (response) {
			}, error: function (err) {
				let response = JSON.parse(err.responseText);

				if (parseInt(response.data.status) === 403) {
					$(".log-err").text(response.data.message);
					$(".log-err").css("display", "block");
				} else {
					window.location.href = "/admin";
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

	$('.btnAccountChangeAddress').click(function(e) {
		$.ajax({
			type: "PUT",
			url: `/account/settings/1/edit`,
			dataType: 'application/json',
			data: {
				address: $('.address').val(),
				city: $('.city').val(),
				state: $('.state').val(),
				postalCode: $('.postalCode').val(),
				country: $('.country').val()
			},
			success: function (response) {
			}, error: function (err) {
				let response = JSON.parse(err.responseText);

				if (parseInt(response.data.status) === 403 || parseInt(response.data.status) === 401) {
					$('.addressFormError .response').addClass('text-danger');
					$('.addressFormError .response').text(response.data.message);
					$('.addressFormError').show();
				} else {
					$('.addressFormError .response').removeClass('text-danger');
					$('.addressFormError .response').addClass('text-success');
					$('.addressFormError .response').text(response.data.message);
					$('.addressFormError').show();
				}
			}
		});
	});

	$('.btnAccountChangePassword').click(function(e) {
		$.ajax({
			type: "PUT",
			url: `/account/settings/2/edit`,
			dataType: 'application/json',
			data: {
				oldPassword: $('.oldPassword').val(),
				newPassword: $('.newPassword').val()
			},
			success: function (response) {
			}, error: function (err) {
				let response = JSON.parse(err.responseText);

				if (parseInt(response.data.status) === 403 || parseInt(response.data.status) === 401) {
					$('.passwordFormError .response').addClass('text-danger');
					$('.passwordFormError .response').text(response.data.message);
					$('.passwordFormError').show();
				} else {
					$('.passwordFormError .response').removeClass('text-danger');
					$('.passwordFormError .response').addClass('text-success');
					$('.passwordFormError .response').text(response.data.message);
					$('.passwordFormError').show();
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
