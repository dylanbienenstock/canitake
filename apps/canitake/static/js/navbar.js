var navbarOpacity = 0.45;

$(function() {
	$navbar = $("#navbar");
	navbarVisible = false;

	$navbar.stop().animate({
		opacity: navbarOpacity
	}, 1000);

	$(document.body).mousemove(function(event) {
		navbarWidth = $navbar.outerWidth();
		navbarHeight = $navbar.outerHeight();
		navbarY = $navbar.offset().top;

		var distance = pointDistanceToLine(
			event.pageX,
			event.pageY,
			0,
			navbarHeight / 2 + navbarY,
			navbarWidth,
			navbarHeight / 2 + navbarY
		);

		if (distance < navbarWidth * 0.2) {
			if (!navbarVisible) {
				navbarVisible = true;

				$navbar.stop().animate({
					opacity: 1
				}, 225);
			}
		} else if (navbarVisible) {
			navbarVisible = false;

			$navbar.stop().animate({
				opacity: navbarOpacity
			}, 225);
		}
	});
});

/* https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment */
function pointDistanceToLine(x, y, x1, y1, x2, y2) {
	var A = x - x1;
	var B = y - y1;
	var C = x2 - x1;
	var D = y2 - y1;

	var dot = A * C + B * D;
	var len_sq = C * C + D * D;
	var param = -1;

	if (len_sq != 0) {
		param = dot / len_sq;
	}

	var xx, yy;

	if (param < 0) {
		xx = x1;
		yy = y1;
	} else if (param > 1) {
		xx = x2;
		yy = y2;
	} else {
		xx = x1 + param * C;
		yy = y1 + param * D;
	}

	var dx = x - xx;
	var dy = y - yy;

	return Math.sqrt(dx * dx + dy * dy);
} 
