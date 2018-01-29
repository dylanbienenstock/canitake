class APIAggregator {
	constructor(Tripsit, RxNorm) {
		this.Tripsit = Tripsit;
		this.RxNorm = RxNorm;
	}

	getAutocompleteSuggestions(input) {
		var deferred = $.Deferred();
		var promise = deferred.promise();
		var tripsitPromise = this.Tripsit.getAutocompleteSuggestions(input);

		$.when(tripsitPromise).done((suggestions) => {
			deferred.resolve(suggestions);
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

		$.when(tripsitPromise).done((valid) => {
			deferred.resolve(valid);
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