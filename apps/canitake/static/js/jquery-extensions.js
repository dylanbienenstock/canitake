var promises = {};

$.onlyNewest = function(name, promise) {
	if (promises[name]) {
		promises[name].abort();
	}

	promises[name] = promise;

	return promise;
}

$.abortLast = function(name) {
	if (promises[name]) {
		promises[name].abort();
	}
}