Math.map = function(value, inMin, inMax, outMin, outMax) {
	return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

Math.randomInt = function(low, high) {
	return Math.floor(Math.randomFloat(low, high));
}

Math.randomFloat = function(low, high) {
	return Math.random() * (high-low) + low;
}