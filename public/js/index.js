document.addEventListener("DOMContentLoaded", function(){
	if (sessionStorage.getItem('productList') !== null) {
    console.log(`Productlist exists`);
	} else
		document.getElementById("cartPrice").innerHTML = "0.00";
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
					window.location.href = "/";
				}
			}
		});
	});
});
