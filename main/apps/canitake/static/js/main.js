var autocompleteTarget;
var validateFirstDrugTimeout;
var validateSecondDrugTimeout;
var submitTimeout;

$(function() {
	getAllDrugNames();

	$(".drug-input").focus(function() {
		autocompleteTarget = $(this);
		moveAutocompleteBoxTo(autocompleteTarget);

		$("#autocomplete-container").empty();
	});

	$(window).resize(function() {
		moveAutocompleteBoxTo(autocompleteTarget);
	});

	$("input").on("input", function() {
		showAutocompleteSuggestions();

		if (this.id == "first-drug") {
			clearTimeout(validateFirstDrugTimeout);

			validateFirstDrugTimeout = setTimeout(function() {
				validateInputs();
			}, 300);
		} else {
			clearTimeout(validateSecondDrugTimeout);

			validateSecondDrugTimeout = setTimeout(function() {
				validateInputs();
			}, 300);	
		}
	});

	$(document).on("click", ".autocomplete-suggestion", function() {
		autocompleteTarget.val($(this).text());
		validateInputs(autocompleteTarget.next(), $(this).text());
		$("#autocomplete-container").empty();
	});

	$("#first-drug").focus();
});

function interfaceBroken() {
	return parseInt($("#interface").css("line-height")) < $("#interface").height() - 5;
}

function getAllDrugNames() {
	var url = "http://tripbot.tripsit.me/api/tripsit/getAllDrugAliases";
	var proxy = "https://cors-anywhere.herokuapp.com/";

	console.log("Getting all drug names...");

	$.getJSON(proxy + url, function(response) {
		if (!response.err) {
			console.log("Finished.");

			showIcon("unknown");

			window.AllDrugNames = response.data[0];
		} else {
			console.log("Error!");
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

function getAutocompleteSuggestions() {
	var input = autocompleteTarget.val().trim();
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

	var input = autocompleteTarget.val().trim();

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

function validateInputs() {
	var firstDrugInput = $("#first-drug").val().trim();
	var secondDrugInput = $("#second-drug").val().trim();

	var firstDrugUnderline = $("#first-drug").next();
	var secondDrugUnderline = $("#second-drug").next();

	var firstDrugValid = validateDrugName(firstDrugUnderline, firstDrugInput);
	var secondDrugValid = validateDrugName(secondDrugUnderline, secondDrugInput);

	console.log(firstDrugValid, secondDrugValid)

	if (firstDrugValid && secondDrugValid) {
		clearTimeout(submitTimeout);
		submitTimeout = setTimeout(function() {
			showIcon("loading");
			getDrugCombo();
		}, 600);
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

		return valid;
	} else {
		$underline.stop().animate({
			backgroundColor: "#FFFFFF"
		});
	}

	return false;
}

function showIcon(iconName) {
	$("#safety-icon-container").children().hide();

	$("#icon-" + iconName).fadeIn();
}

function getDrugCombo() {
	var url = "http://tripbot.tripsit.me/api/tripsit/getInteraction";
	var data = "?drugA=" + $("#first-drug").val() + "&drugB=" + $("#second-drug").val();
	var proxy = "https://cors-anywhere.herokuapp.com/";

	console.log("Getting drug combo...");
	console.log(url + data);

	$.getJSON(proxy + url + data, function(response) {
		if (!response.err && response.data[0] != false) {
			console.log("Finished.");

			displayDrugCombo(response.data[0]);
		} else {
			console.log("Error!");
		}

		console.log(response)
	});
}

function displayDrugCombo(data) {
	console.log(data.status)

	switch (data.status) {
		case "Low Risk & Synergy":
			showIcon("synergy");
			break;
		case "Low Risk & No Synergy":
			showIcon("nosynergy");
			break;
		case "Low Risk & Decrease":
			showIcon("decrease");
			break;
		case "Caution":
			showIcon("caution");
			break;
		case "Unsafe":
			showIcon("unsafe");
			break;
		case "Dangerous":
			showIcon("dangerous");
			break;
		default:
			showIcon("unknown");
			break;
	}
}