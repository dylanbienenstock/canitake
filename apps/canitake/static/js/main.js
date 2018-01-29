var Tripsit = new TripsitAPI();
var RxNorm = null; // new RxNormAPI();
var Aggregator = new APIAggregator(Tripsit, RxNorm);

var autocompleteTarget;
var validateFirstDrugTimeout;
var validateSecondDrugTimeout;
var submitTimeout;
var checkingCombo;

$(function() {
	$.when(Tripsit.getAllDrugNames()).then((success) => {
		showIcon("unknown");
	});

	$(".drug-input").focus(function() {
		autocompleteTarget = $(this);
		moveAutocompleteBoxTo(autocompleteTarget);

		$("#autocomplete").empty();
	});

	$(window).resize(function() {
		moveAutocompleteBoxTo(autocompleteTarget);
	});

	$("input").on("input", function() {
		$("#autocomplete").empty();

		if (checkingCombo) { // Reset the interface
			checkingCombo = false;
			showIcon("unknown");

			$(document.body).animate({
				backgroundColor: "#444"
			}, 500);

			$("#combo-status").text("Unknown").stop().fadeOut();
			$("#more-info-container").stop().fadeOut();
		}

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
		$("#autocomplete").empty();
		autocompleteTarget.focus();
	});

	$(document).on("click", "#more-info-container", function() {
		$("html, body").animate({
			scrollTop: $(document.body).height()
		}, 1000);

		setTimeout(function() {
			$("html, body").animate({
				scrollTop: 0
			}, 1000);
		}, 1500);
	});

	$("#first-drug").focus();
});

function getAutocompleteSuggestions(input) {
	if (!Tripsit.allDrugNames) return;

	var input = autocompleteTarget.val().trim();

	$("#autocomplete").empty();

	if (input) {
		var promise = $.onlyNewest("autocomplete", Aggregator.getAutocompleteSuggestions(input));

		$.when(promise).then(function(suggestions) {
			$("#autocomplete-loading").hide();

			showAutocompleteSuggestions(input, suggestions);
		});
	}
}

function validateInputs() { // TO DO: clean up this monstrocity
	var targetId = autocompleteTarget.attr("id");

	var firstInput = $("#first-drug").val().trim();
	var secondInput = $("#second-drug").val().trim();

	var firstUnderline = $("#first-drug").next();
	var secondUnderline = $("#second-drug").next();

	var firstPromise = $.onlyNewest("first-validation", Aggregator.validateDrug(firstInput));
	var secondPromise = $.onlyNewest("second-validation", Aggregator.validateDrug(secondInput));

	if ((firstInput && targetId == "first-drug") || 
		(secondInput && targetId == "second-drug")) {

		$("#autocomplete-loading").show();
	}

	if (!firstInput) {
		firstUnderline.stop().animate({
			backgroundColor: "#FFFFFF"
		});
	}

	if (!secondInput) {
		secondUnderline.stop().animate({
			backgroundColor: "#FFFFFF"
		});
	}

	$.when(firstPromise, secondPromise).done((firstValid, secondValid) => {
		firstUnderline.stop().animate({
			backgroundColor: firstInput ? (firstValid ? "#33FF33" : "#FF3333") : "#FFFFFF"
		});

		secondUnderline.stop().animate({
			backgroundColor: secondInput ? (secondValid ? "#33FF33" : "#FF3333") : "#FFFFFF"
		});

		if ((firstValid && targetId == "first-drug") || 
			(secondValid && targetId == "second-drug")) {

			$("#autocomplete-loading").hide();
		}

		if (firstValid && secondValid) {
			clearTimeout(submitTimeout);
			submitTimeout = setTimeout(() => {
				showIcon("loading");
				getInteraction(firstInput, secondInput);
			}, 600);
		} else if ((!firstValid && targetId == "first-drug") || 
				   (!secondValid && targetId == "second-drug")) {

			getAutocompleteSuggestions();	
		}
	});
}


function getInteraction(drugA, drugB) {
	checkingCombo = true;

	var promise = $.onlyNewest("interaction", Aggregator.getInteraction(drugA, drugB));

	$.when(promise).then(displayInteraction);
}