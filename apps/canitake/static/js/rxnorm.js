class RxNormAPI {
	constructor() {
		this.proxy = "https://cors-anywhere.herokuapp.com/";
		this.api = "https://rxnav.nlm.nih.gov/REST/";
		this.cachedRXCUI = {};
	}

	getAutocompleteSuggestions(input) {
		var deferred = $.Deferred();
		var promise = deferred.promise();
		var data = "spellingsuggestions.json?name=" + input;

		var request = $.getJSON(this.proxy + this.api + data, function(response) {
			if (response) {
				if (response.suggestionGroup) {
					if (response.suggestionGroup.suggestionList) {
						deferred.resolve(response.suggestionGroup.suggestionList.suggestion);
					}
				}
			}

			deferred.resolve([]);
		});

		promise.abort = function() {
			request.abort();
			deferred.reject();
		}

		return promise;
	}

	validateDrug(input) {
		var deferred = $.Deferred();
		var promise = deferred.promise();

		var data = "rxcui.json?name=" + input;

		var request = $.getJSON(this.proxy + this.api + data, function(response) {
			if (response) {
				if (response.idGroup) {
					if (response.idGroup.rxnormId) {
						this.cachedRXCUI[input] = response.idGroup.rxnormId[0]; 

						deferred.resolve(true);
					}
				}
			}

			deferred.resolve(false);
		}.bind(this));

		promise.abort = function() {
			request.abort();
			deferred.reject();
		}

		return promise;
	}

	getInteraction(drugA, drugB) {
		var deferred = $.Deferred();
		var promise = deferred.promise();

		var rxcuiA = this.cachedRXCUI[drugA];
		var rxcuiB = this.cachedRXCUI[drugB];

		var data = "interaction/list.json?rxcuis=" + rxcuiA + "+" + rxcuiB + "&sources=ONCHigh";

		console.log("(RxNORM) Getting drug interaction...");

		var request = $.getJSON(this.proxy + this.api + data, function(response) {
			if (response) {
				if (response.fullInteractionTypeGroup) {
					if (response.fullInteractionTypeGroup[0].fullInteractionType) {
						if (response.fullInteractionTypeGroup[0].fullInteractionType[0].interactionPair) {
							if (response.fullInteractionTypeGroup[0].fullInteractionType[0].interactionPair) {

								var interaction = response.fullInteractionTypeGroup[0].fullInteractionType[0].interactionPair[0];
								delete interaction.interactionConcept;

								deferred.resolve(new Interaction({
									drugA: drugA,
									drubB: drugB,
									status: interaction.severity,
									comment: interaction.description,
									source: "RxNorm"
								}));
							}
						}
					}
				} else {
					deferred.resolve(null);
				}
			}
			
			console.log("(RxNorm) Finished.");
		});

		promise.abort = function() {
			request.abort();
			deferred.reject();
		}

		return promise;
	}
}