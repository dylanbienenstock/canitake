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
						this.cachedRXCUI = response.idGroup.rxnormId[0]; 

						deferred.resolve(true);
					}
				}
			}

			deferred.resolve(false);
		});

		promise.abort = function() {
			request.abort();
			deferred.reject();
		}

		return promise;
	}
}