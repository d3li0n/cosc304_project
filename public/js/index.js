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
});