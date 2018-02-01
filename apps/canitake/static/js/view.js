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
	$("#drug-view-threshold-dose").hide();
	$("#drug-view-light-dose").hide();
	$("#drug-view-common-dose").hide();
	$("#drug-view-strong-dose").hide();
	$("#drug-view-heavy-dose").hide();

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

			`).appendTo($("#drug-view-section-dose")).show();
		}
	}

	centerInterface();
}

function showDuration(info, ROA) {
	if (info.onset[ROA]) {
		$("#drug-view-onset").show().text("Onset: " + info.onset[ROA]);
	}

	if (info.duration[ROA]) {
		$("#drug-view-duration").show().text("Duration: " + info.duration[ROA]);
	}

	if (info.aftereffects[ROA]) {
		$("#drug-view-aftereffects").show().text("After-effects: " + info.aftereffects[ROA]);
	}

	centerInterface();
}

function populateDrugView(info) {
	$("#drug-view-container").fadeIn().css({ display: "flex" });
	$("#drug-view-loading").hide();
	centerInterface();

	console.log(info);

	var ROA = Object.keys(info.dose)[0];

	showDoses(info.dose[ROA]);

	if (info.multipleROAs) {
		showDuration(info, ROA);

		$("#drug-view-roa-container-dose").show();
		$("#drug-view-roa-container-duration").show();

		var first = true;

		info.ROAs.forEach(function(ROA) {
			var doseButton = $(`
				<button class="drug-view-roa drug-view-roa-dose noselect">${ROA}</button>

			`).appendTo($("#drug-view-roa-container-dose"))
			.click(function() {
				$(".drug-view-roa-dose").removeClass("drug-view-roa-selected")
				$(this).addClass("drug-view-roa-selected")

				showDoses(info.dose[ROA]);
			});

			var durationButton = $(`
				<button class="drug-view-roa drug-view-roa-duration noselect">${ROA}</button>

			`).appendTo($("#drug-view-roa-container-duration"))
			.click(function() {
				$(".drug-view-roa-duration").removeClass("drug-view-roa-selected")
				$(this).addClass("drug-view-roa-selected")

				showDuration(info, ROA);
			});

			if (first) {
				first = false;

				doseButton.addClass("drug-view-roa-selected");
				durationButton.addClass("drug-view-roa-selected");
			}
		});
	} else {
		if (info.onset) {
			$("#drug-view-onset").show().text("Onset: " + info.onset);
		}

		if (info.duration) {
			$("#drug-view-duration").show().text("Duration: " + info.duration);
		}

		if (info.aftereffects) {
			$("#drug-view-aftereffects").show().text("After-effects: " + info.aftereffects);
		}
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