$(function() {
	getAllDrugNames();

	var autocompleteTarget;

	$(".drug-input").focus(function() {
		autocompleteTarget = $(this);
		moveAutocompleteBoxTo(autocompleteTarget);

		$("#autocomplete-container").empty();
	});

	$(window).resize(function() {
		moveAutocompleteBoxTo(autocompleteTarget);
	});

	$("input").on("input", function() {
		if (!window.AllDrugNames) return;

		$("#autocomplete-container").empty();

		var input = $(this).val().trim();

		if (input) {
			var suggestions = getAutocompleteSuggestions(input);

			for (var i = 0; i < Math.min(suggestions.length, 5); i++) {
				if (suggestions[i] == input) {
					$("#autocomplete-container").empty();

					break;
				}

				$("#autocomplete-container").append(`
					<p class="autocomplete-suggestion noselect">${suggestions[i]}</p>
				`)
			}
		}
	});

	$(document).on("click", ".autocomplete-suggestion", function() {
		autocompleteTarget.val($(this).text());
		$("#autocomplete-container").empty();
	});

	$("#first-drug").focus();
});

function getAllDrugNames() {
	var url = "http://tripbot.tripsit.me/api/tripsit/getAllDrugAliases";
	var proxy = "https://cors-anywhere.herokuapp.com/";

	console.log("Getting all drug names...");

	$.getJSON(proxy + url, function(response) {
		if (!response.err) {
			console.log("Finished.")

			window.AllDrugNames = response.data[0];
		} else {
			console.log("Error!")
		}
	});
}

function moveAutocompleteBoxTo($element) {
	if ($element) {
		$("#autocomplete-container").offset({
			top: Math.round($element.offset().top + $element.parent().outerHeight() * 1.25),
			left: Math.round($element.offset().left)
		});
	}
}

function getAutocompleteSuggestions(input) {
	var suggestions = [];

	window.AllDrugNames.forEach(function(drug) {
		if (drug.startsWith(input)) {
			suggestions.push(drug);
		}
	});

	return suggestions;
}