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
			<p class="autocomplete-suggestion noselect">${suggestions[i]}</p>
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

function displayInteraction(result) {
	if (checkingCombo) {
		$("#combo-status").text(result.status).stop().hide().fadeIn();
		$("#more-info-container").stop().fadeIn().css("display", "inline-block");

		var color = "#444";

		switch (result.status) {
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