document.addEventListener("DOMContentLoaded", function(){
	if (sessionStorage.getItem('productList') !== null) {
    console.log(`Productlist exists`);
	} else
		document.getElementById("cartPrice").innerHTML = "0.00";

	if (localStorage.getItem('custName') !== null) {
		if (new Date(localStorage.getItem('custNameExpiresAt')) >= new Date())
			document.getElementById("header-lgnName").innerHTML = localStorage.getItem('custName');
		else {
			localStorage.removeItem('custName');
			localStorage.removeItem('custNameExpiresAt');
		}

	} else
		document.getElementById("header-lgnName").innerHTML = "";
});

$(document).ready(function () {
	$("#shopSearchBtn").keyup(function (e) {
		if (e.keyCode == 13)
			window.location.href = "/store?search=" + $(this).val();
	});

	$('.fa-search').click(function(e) {  
    window.location.href = "/store?search=" + $("#shopSearchBtn").val();
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
					localStorage.setItem('custName', `${response.data.message.firstName} ${response.data.message.lastName}`);
					localStorage.setItem('custNameExpiresAt', response.data.message.expiresAt);
					window.location.href = "/";
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
					localStorage.removeItem('custName');
					window.location.href = "/";
				}
			}
		});
	});
});
