var autocompleteTarget;
var validateFirstDrugTimeout;
var validateSecondDrugTimeout;
var submitTimeout;
var checkingCombo;

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
		if (checkingCombo) { // Reset the interface
			checkingCombo = false;
			showIcon("unknown");

			$(document.body).animate({
				backgroundColor: "#444"
			}, 500);

			$("#combo-status").text("Unknown").stop().fadeOut();
			$("#more-info-container").stop().fadeOut();
		}

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
		autocompleteTarget.focus();
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

function showIcon(iconName, skipTransition) {
	$("#safety-icon-container").children().hide();

	if (skipTransition) {
		$("#icon-" + iconName).show();
	} else {
		$("#icon-" + iconName).fadeIn();
	}
}

function getDrugCombo() {
	checkingCombo = true;

	var url = "http://tripbot.tripsit.me/api/tripsit/getInteraction";
	var data = "?drugA=" + $("#first-drug").val() + "&drugB=" + $("#second-drug").val();
	var proxy = "https://cors-anywhere.herokuapp.com/";

	console.log("Getting drug combo...");

	$.getJSON(proxy + url + data, function(response) {
		displayDrugCombo(response.data[0]);

		console.log(response)
	});
}

function displayDrugCombo(data) {
	if (checkingCombo) {
		console.log(data.status)

		$("#combo-status").text(data.status).stop().hide().fadeIn();
		$("#more-info-container").stop().fadeIn().css("display", "inline-block");

		var color = "#444";

		switch (data.status) {
			case "Low Risk & Synergy":
				showIcon("synergy");
				color = "#7F7";
				break;
			case "Low Risk & No Synergy":
				showIcon("nosynergy");
				color = "#7F7";
				break;
			case "Low Risk & Decrease":
				showIcon("decrease");
				color = "#66F";
				break;
			case "Caution":
				showIcon("caution");
				color = "#FB0";
				break;
			case "Unsafe":
				showIcon("unsafe");
				color = "#FB0";
				break;
			case "Dangerous":
				showIcon("dangerous");
				color = "#F11";
				break;
			default:
				showIcon("unknown");
				break;
		}

		$(document.body).animate({
			backgroundColor: color
		}, 500);
	}
}