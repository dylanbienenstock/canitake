function interfaceBroken() {
	return parseInt($("#interface").css("line-height")) < $("#interface").height() - 5;
}

function moveAutocompleteBoxTo(element) {
	if (element) {
		$("#autocomplete-container").offset({
			top: Math.round(element.offset().top + element.parent().outerHeight() * 1.25),
			left: Math.round(element.offset().left)
		});
	}
}

function showAutocompleteSuggestions(input, suggestions) {
	for (var i = 0; i < Math.min(suggestions.length, 5); i++) {
		if (suggestions[i] == input) {
			$("#autocomplete").empty();

			break;
		}

		$("#autocomplete").append(`
			<p class="autocomplete-suggestion noselect">${suggestions[i].toLowerCase()}</p>
		`);
	}
}

function showIcon(iconName, skipTransition) {
	$("#safety-icon-container").children().hide();

	if (skipTransition) {
		$("#icon-" + iconName).show();
	} else {
		$("#icon-" + iconName).fadeIn();
	}
}

function displayInteraction(interactionList) {
	var interaction = interactionList.Tripsit || interactionList.RxNorm || {};

	if (checkingCombo) {
		$("#combo-status").text(interaction.status || "Unknown").stop().animate({
			opacity: 1
		});
		$("#more-info-container").stop().fadeIn().css("display", "inline-block");

		var color = "#444";

		switch (interaction.status) {
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

function setUnderlineColor(inputId, color) {
	$("#" + inputId).next().animate({
		backgroundColor: color
	});
}

function displayLoader(inputId, visible) {
	$("#autocomplete-loading-" + inputId).css({
		visibility: visible ? "visible" : "hidden"
	});
}

function floatInfoSelection(selection) {
	floatingSelection = $("#more-info-selection");

	$(".more-info-link").not(selection).animate({
		opacity: 0
	}, 1000, function() {
		var a = $("#more-info-content").offset().top
		var b = $(selection).offset().top
		var y = b - a;

		floatingSelection.css({ visibility: "hidden" })
		.text($(selection).text())
		.velocity({ translateY: 0 })
		.finish()
		.velocity({ translateY: y }, function() {
			$(selection).css({ opacity: 0 });
			floatingSelection.css({ visibility: "visible" })
			floatingSelection.velocity({ translateY: 0 }, 650, function() {
				$("#more-info-link-container").hide();
			});
		})
		.finish()
	});
}