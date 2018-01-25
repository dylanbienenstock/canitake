$(function() {
	getAllDrugNames();
});

function getAllDrugNames() {
	var url = "http://tripbot.tripsit.me/api/tripsit/getAllDrugAliases";
	var proxy = "https://cors-anywhere.herokuapp.com/";

	$.getJSON(proxy + url, function(response) {
		if (!response.err) {
			console.log(response.data);
		}
	});
}