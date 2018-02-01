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

function floatInfoSelection(selection, callback) {
	var floatingSelection = $("#more-info-selection");
	var callbackFired = false;

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
				if (!callbackFired) {
					callbackFired = true;

					$("#more-info-link-container").hide();
					callback();
				}
			});
		})
		.finish()
	});
}

function showDoses(dose) {
	if (dose.Threshold) {
		$("#drug-view-threshold-dose").show().text("Threshold: " + dose.Threshold);
	}

	if (dose.Light) {
		$("#drug-view-light-dose").show().text("Light: " + dose.Light);
	}

	if (dose.Common) {
		$("#drug-view-common-dose").show().text("Common: " + dose.Common);
	}

	if (dose.Strong) {
		$("#drug-view-strong-dose").show().text("Strong: " + dose.Strong);
	}

	if (dose.Heavy) {
		$("#drug-view-heavy-dose").show().text("Heavy: " + dose.Heavy);
	}

	for (var doseType in dose) {
		if (!["Threshold", "Light", "Common", "Strong", "Heavy"].includes(doseType)) {

			$(`
				<p class="drug-view-info">${doseType}: ${dose[doseType]}</p>

			`).prependTo($("#drug-view-section-dose")).show();
		}
	}
}

function populateDrugView(info) {
	$("#drug-view-container").fadeIn().css({ display: "flex" });
	$("#drug-view-loading").hide();
	centerInterface();

	console.log(info);

	var ROA = Object.keys(info.dose)[0];

	if (info.multipleROAs) {
		$("#drug-view-title-dose").text("Dose");
		$("#drug-view-roa-container-dose").show();

		info.ROAs.forEach(function(ROA) {
			console.log(ROA);

			$(`
				<button class="drug-view-roa">${ROA}</button> 

			`).appendTo($("#drug-view-roa-container-dose"))
			.click(function() {
				showDoses(info.dose[ROA]);
			});
		});
	} else {
		$("#drug-view-title-dose").text("Dose (" + ROA + ")");
	}

	showDoses(info.dose[ROA]);

	if (info.onset) {
		$("#drug-view-onset").show().text("Onset: " + info.onset);
	}

	if (info.duration) {
		$("#drug-view-duration").show().text("Duration: " + info.duration);
	}

	if (info.aftereffects) {
		$("#drug-view-aftereffects").show().text("After-effects: " + info.aftereffects);
	}

	if (info.categories) {
		info.categories.forEach((category) => {
			$("#drug-view-category-container").show().append(`
				<span class="drug-view-category">${category}</span>
			`);
		});
	}

	if (info.effects) {
		//////////////////////////////////////////////////////////////////
	}

	if (info.note) {
		$("#drug-info-note").show().text(info.note);
	}

	centerInterface();
}

function showDrugView(selection) {
	floatInfoSelection(selection, function() {
		if (selection.id == "more-info-link-first-drug" || selection.id == "more-info-link-second-drug") {
			$("#drug-view-loading").show().center();
			getDrugInfo($(selection).text());
		}
	});
}