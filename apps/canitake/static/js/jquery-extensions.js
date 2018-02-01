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

$.fn.extend({
	center: function() {
		if ($(this).css("display") == "none") return;

		$(this).css({
			display: "inline-block"
		}).offset({
			left: $(this).parent().offset().left + $(this).parent().innerWidth() / 2 - $(this).outerWidth() / 2,
			top: $(this).parent().offset().top + $(this).parent().innerHeight() / 2 - $(this).outerHeight() / 2
		});
	},

	textCapitalized: function(text) {
		text = text.charAt(0).toUpperCase() + text.slice(1);
		$(this).text(text);
	}
});