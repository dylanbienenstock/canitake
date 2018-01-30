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
}