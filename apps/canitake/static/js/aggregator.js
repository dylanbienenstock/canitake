class APIAggregator {
	constructor(Tripsit, RxNorm) {
		this.Tripsit = Tripsit;
		this.RxNorm = RxNorm;
	}

	getAutocompleteSuggestions(input) {
		var deferred = $.Deferred();
		var promise = deferred.promise();
		var tripsitPromise = this.Tripsit.getAutocompleteSuggestions(input);
		var rxnormPromise = this.RxNorm.getAutocompleteSuggestions(input);

		$.when(tripsitPromise, rxnormPromise).done((tsSuggestions, rxSuggestions) => {
			var data = tsSuggestions.concat(rxSuggestions);
			var searcher = new FuzzySearch({ source: data });
			var result = searcher.search(input);
			result = result.filter((el, i, arr) => arr.indexOf(el) === i);

			if (result.length > 0) {
				deferred.resolve(result);
			} else {
				var suggestions = [];

				tsSuggestions.forEach(function(drug) {
					if (drug.startsWith(input)) {
						suggestions.push(drug);
					}
				});

				deferred.resolve(suggestions);
			}
		});

		promise.abort = function() {
			tripsitPromise.abort();
			deferred.reject();
		}

		return promise;
	}

	validateDrug(input) {
		var deferred = $.Deferred();
		var promise = deferred.promise();
		var tripsitPromise = this.Tripsit.validateDrug(input);
		var rxnormPromise = this.RxNorm.validateDrug(input);

		$.when(tripsitPromise, rxnormPromise).done((tsValid, rxValid) => {
			deferred.resolve(tsValid || rxValid);
		});

		promise.abort = function() {
			tripsitPromise.abort();
			deferred.reject();
		}

		return promise;
	}

	getInteraction(drugA, drugB) {
		var deferred = $.Deferred();
		var promise = deferred.promise();
		var tripsitPromise = this.Tripsit.getInteraction(drugA, drugB);

		$.when(tripsitPromise).done((result) => {
			deferred.resolve(result);
		});

		promise.abort = function() {
			tripsitPromise.abort();
			deferred.reject();
		}

		return promise;
	}
}