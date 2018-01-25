$(function() {
	getAllDrugNames();

	var autocompleteTarget;
	var validateTimeout;

	$(".drug-input").focus(function() {
		autocompleteTarget = $(this);
		moveAutocompleteBoxTo(autocompleteTarget);

		$("#autocomplete-container").empty();
	});

	$(window).resize(function() {
		moveAutocompleteBoxTo(autocompleteTarget);
	});

	$("input").on("input", function() {
		var input = $(this).val().trim();
		var $underline = $(this).next();

		showAutocompleteSuggestions(input);

		clearTimeout(validateTimeout);
		validateTimeout = setTimeout(function() {
			validateDrugName($underline, input);
		}, 300);
	});

	$(document).on("click", ".autocomplete-suggestion", function() {
		autocompleteTarget.val($(this).text());
		validateDrugName(autocompleteTarget.next(), $(this).text());
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

function showAutocompleteSuggestions(input) {
	if (!window.AllDrugNames) return;

	$("#autocomplete-container").empty();

	if (input) {
		var suggestions = getAutocompleteSuggestions(input);

		for (var i = 0; i < Math.min(suggestions.length, 5); i++) {
			if (suggestions[i] == input) {
				$("#autocomplete-container").empty();

				break;
			}

			$("#autocomplete-container").append(`
				<p class="autocomplete-suggestion noselect">${suggestions[i]}</p>
			`);
		}
	}
}

function validateDrugName($underline, input) {
	if (!window.AllDrugNames) return;

	if (input) {
		var valid = false;

		for (var i = 0; i < window.AllDrugNames.length; i++) {
			if (window.AllDrugNames[i] == input) {
				valid = true;

				break;
			}
		}

		if (valid) {
			$underline.stop().animate({
				backgroundColor: "#33FF33"
			});
		} else {
			$underline.stop().animate({
				backgroundColor: "#FF3333"
			});
		}
	} else {
		$underline.stop().animate({
			backgroundColor: "#FFFFFF"
		});
	}
}