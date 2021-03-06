var Tripsit = new TripsitAPI();
var RxNorm = new RxNormAPI();
var Aggregator = new APIAggregator(Tripsit, RxNorm);

var autocompleteTarget;
var validateFirstDrugTimeout;
var validateSecondDrugTimeout;
var submitTimeout;
var firstValid;
var secondValid;
var validatingFirst;
var validatingSecond;
var autocompleted;
var checkingCombo;

$(function() {
	$.when(Tripsit.getAllDrugNames()).then((success) => {
		showIcon("unknown");
	});

	$(".drug-input").focus(function() {
		autocompleteTarget = $(this);
		moveAutocompleteBoxTo(autocompleteTarget);

		$("#autocomplete").empty();

		if (!autocompleted) {
			autocompleted = false;

			if (!validatingFirst) {
				displayLoader("first-drug", false);
			}

			if (!validatingSecond) {
				displayLoader("second-drug", false);
			}
		}

		$.abortLast("autocomplete");
	});

	$(window).resize(function() {
		moveAutocompleteBoxTo(autocompleteTarget);
	});

	$("input").on("input", function() {
		$("#autocomplete").empty();

		if (checkingCombo) { // Reset the interface
			resetInterface();
		}

		$.abortLast("autocomplete");

		var input = autocompleteTarget.val().trim()

		if (input) {
			if (this.id == "first-drug") {
				clearTimeout(validateFirstDrugTimeout);

				validateFirstDrugTimeout = setTimeout(function() {
					validateInput("first-drug", input);
				}, 300);
			} else {
				clearTimeout(validateSecondDrugTimeout);

				validateSecondDrugTimeout = setTimeout(function() {
					validateInput("second-drug", input);
				}, 300);	
			}
		} else {
			var id = autocompleteTarget.attr("id");

			setUnderlineColor(id, "#FFFFFF")
			displayLoader(id, false);

			if (id == "first-drug") {
				clearTimeout(validateFirstDrugTimeout);
			} else {
				clearTimeout(validateSecondDrugTimeout);
			}
		}
	});

	$(document).on("click", ".autocomplete-suggestion", function() {
		autocompleted = true;

		autocompleteTarget.val($(this).text());
		validateInput(autocompleteTarget.attr("id"), $(this).text());
		$("#autocomplete").empty();
		autocompleteTarget.focus();
	});

	$(document).on("click", "#more-info-container", function() {
		$("#more-info-container").animate({ opacity: 0 }, 500);
		$("#back-container").animate({ opacity: 1 }, 1250);

		$("html, body").animate({
			scrollTop: $(document.body).height()
		}, 1000);
	});

	$(document).on("click", "#back-container", function() {
		if (!window.inMoreInfoView) {
			$("#back-container").animate({ opacity: 0 }, 500);
			$("#more-info-container").animate({ opacity: 1 }, 1250);

			$("html, body").animate({
				scrollTop: 0
			}, 1000);
		} else if (window.backButtonTransitioned) {
			floatInfoSelectionDown()
		}
	});

	$(document.body).resize(function() {
		centerInterface();
	});

	$("html, body").animate({
		scrollTop: 0
	}, 500);

	$(".more-info-link").click(function(event) {
		$("#more-info-link-container").css({ pointerEvents: "none" });
		$(this).css({ opacity: 1 })

		showDrugView(this);
	});

	centerInterface();
	$("#first-drug").focus();
});

function centerInterface() {
	$("#more-info-link-container").center();
	$(".drug-view").each(function() {
		$(this).center();
	});
	$("#drug-view-loading").center();
}

function resetInterface() {
	checkingCombo = false;
	showIcon("unknown");

	$(document.body).animate({
		backgroundColor: "#444"
	}, 500);

	$("#more-info-container").stop().fadeOut();
	$("#combo-status").stop().animate({
		opacity: 0
	});

	clearTimeout(submitTimeout);
	$.abortLast("interaction");
	showIcon("unknown")
}

function getAutocompleteSuggestions(input) {
	if (!Tripsit.allDrugNames) return;

	var input = autocompleteTarget.val().trim();

	$("#autocomplete").empty();

	if (input) {
		var promise = $.onlyNewest("autocomplete", Aggregator.getAutocompleteSuggestions(input));

		$.when(promise).then(function(suggestions) {
			displayLoader(autocompleteTarget.attr("id"), false);

			showAutocompleteSuggestions(input, suggestions);
		});
	}
}

function validateInput(id, input) {
	if (id == "first-drug") {
		validatingFirst = true;
	} else {
		validatingSecond = true;
	}

	displayLoader(id, true);

	var promise = $.onlyNewest("validation-" + id, Aggregator.validateDrug(input));

	$.when(promise).then((valid) => {
		if (valid || autocompleteTarget.attr("id") != id) {
			displayLoader(id, false);
		}

		if (id == "first-drug") {
			validatingFirst = false;
			firstValid = valid;
		} else {
			validatingSecond = false;
			secondValid = valid;
		}

		if (valid) {
			setUnderlineColor(id, "#33FF33")
			$("#autocomplete").empty();
		} else {
			setUnderlineColor(id, "#FF3333")
			getAutocompleteSuggestions();
		}

		if (firstValid && secondValid) {
			clearTimeout(submitTimeout);
			submitTimeout = setTimeout(function() {
				var drugA = $("#first-drug").val().trim();
				var drugB = $("#second-drug").val().trim();

				getInteraction(drugA, drugB);
			}, 600);
		}
	});
}

function getInteraction(drugA, drugB) {
	checkingCombo = true;
	
	showIcon("loading");
	$("#more-info-link-first-drug").textCapitalized(drugA);
	$("#more-info-link-second-drug").textCapitalized(drugB);
	$("#more-info-link-container").center();

	var promise = $.onlyNewest("interaction", Aggregator.getInteraction(drugA, drugB));

	$.when(promise).then(displayInteraction);
}

function getDrugInfo(drug) {
	var promise = $.onlyNewest("drug-info", Aggregator.getDrugInfo(drug));

	$.when(promise).then((info) => {
		showBackButton(true);

		populateDrugView(info);
	});
}