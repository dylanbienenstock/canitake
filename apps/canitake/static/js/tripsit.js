class TripsitAPI {
	constructor() {
		this.proxy = "https://cors-anywhere.herokuapp.com/";
		this.api = "http://tripbot.tripsit.me/api/tripsit/";
	}

	fakeLatency() {
		return 500 + Math.random() * 1000;
	}

	getAllDrugNames() {
		var deferred = $.Deferred();

		console.log("(TRIPSIT) Getting all drug names...");

		$.getJSON(this.proxy + this.api + "getAllDrugAliases", function(response) {
			if (!response.err) {
				console.log("(TRIPSIT) Finished.");

				showIcon("unknown");

				this.allDrugNames = response.data[0];
				deferred.resolve(true);
			} else {
				console.log("(TRIPSIT) Error!");
			}

			deferred.resolve(false);
		}.bind(this));

		return deferred.promise();
	}

	getAutocompleteSuggestions(input) {
		var deferred = $.Deferred();
		var promise = deferred.promise();

		setTimeout(function() {
			deferred.resolve(this.allDrugNames);
		}.bind(this), this.fakeLatency());

		promise.abort = function() {
			deferred.reject();
		}

		return promise;
	}

	validateDrug(input) {
		var deferred = $.Deferred();
		var promise = deferred.promise();

		setTimeout(() => {
			if (input) {
				for (var i = 0; i < this.allDrugNames.length; i++) {
					if (this.allDrugNames[i] == input) {
						deferred.resolve(true);

						break;
					}
				}
			}

			deferred.resolve(false);
		}, 0);

		promise.abort = function() {
			deferred.reject();
		}

		return promise;
	}

	getInteraction(drugA, drugB) {
		var deferred = $.Deferred();
		var promise = deferred.promise();

		var data = "getInteraction?drugA=" + drugA + "&drugB=" + drugB;

		console.log("(TRIPSIT) Getting drug interaction...");

		var request = $.getJSON(this.proxy + this.api + data, (response) => {
			if (response && !response.err) {
				if (response.data) {
					var interaction = response.data[0];

					deferred.resolve(new Interaction({
						drugA: drugA,
						drubB: drugB,
						status: interaction.status,
						comment: interaction.note,
						source: "Tripsit"
					}));
				}
			} else {
				deferred.resolve(null);
			}

			console.log("(TRIPSIT) Finished.");
		});

		promise.abort = function() {
			request.abort();
			deferred.reject();
		}

		return promise;
	}

	getDrugInfo(drug) {
		var deferred = $.Deferred();
		var promise = deferred.promise();

		var data = "getDrug?name=" + drug;

		console.log("(TRIPSIT) Getting drug information...");

		var request = $.getJSON(this.proxy + this.api + data, (response) => {
			if (response && !response.err) {
				if (response.data) {
					console.log(response)

					var info = response.data[0];
					var multipleROAs = !info.formatted_duration.hasOwnProperty("value");

					if (multipleROAs) {
						for (var ROA in response.data[0].formatted_onset) {
							info.formatted_onset[ROA] = info.formatted_onset[ROA].value
													 + " " + info.formatted_onset[ROA]._unit;
						}

						for (var ROA in response.data[0].formatted_duration) {
							info.formatted_duration[ROA] = info.formatted_duration[ROA].value
													 + " " + info.formatted_duration[ROA]._unit;
						}

						for (var ROA in response.data[0].formatted_aftereffects) {
							info.formatted_aftereffects[ROA] = info.formatted_aftereffects[ROA].value
													 + " " + info.formatted_aftereffects[ROA]._unit;
						}
					} else {
						info.formatted_onset = info.formatted_onset.value + " " + info.formatted_onset._unit;
						info.formatted_duration = info.formatted_duration.value + " " + info.formatted_duration._unit;
						info.formatted_aftereffects = info.formatted_aftereffects.value + " " + info.formatted_aftereffects._unit;
					}

					var infoResponse = {
						categories: info.categories,
						multipleROAs: multipleROAs,
						ROAs: Object.keys(info.formatted_dose),
						dose: info.formatted_dose,
						onset: info.formatted_onset,
						duration: info.formatted_duration,
						aftereffects: info.formatted_aftereffects,
						effects: info.formatted_effects,
						note: info.dose_note ? info.dose_note.replace(/NOTE:/gi , "") : null
					};

					deferred.resolve(infoResponse);
				}
			}

			console.log("(TRIPSIT) Finished.");
		});

		promise.abort = function() {
			request.abort();
			deferred.reject();
		}

		return promise;
	}
}