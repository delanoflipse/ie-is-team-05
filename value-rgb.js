
/**
 * @file value-rgb.js
 * @copyright Delano Flipse 2020
 * Smooth transition between levels of activity/alertness
 * 
 * INLETS:
 * [ alertness, fade ]
 * 
 * alertness        = [ 0 - 1000]   the level of alertness
 * fade		        = [ 0 - 1000]   the fade brightness
 * 
 * OUTLETS:
 * [ r, g, b ]
 * 
 * r				= [ 0 - 1024]   red value
 * g				= [ 0 - 1024]   green value
 * b				= [ 0 - 1024]   blue value
 */

// declare inlets and outlets
inlets = 2;
outlets = 3;

// input variables
var alertness = 0;
var fade = 0;

// color constants
var MAX_RED = 1024;
var MAX_BLUE = 50;

// script variables
var red = 0;
var green = 0;
var blue = 0;

/** output current values */
function bang() {
	outlet(0, red);
	outlet(1, green);
	outlet(2, blue);
}

/**
 * in-out cubic easing function
 * @see https://easings.net/
 * @param {float} x a value between 0 and 1
 */
function easeInOutCubic(x) {
	return x < 0.5
		? 4 * x * x * x
		: 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Incoming input */
function msg_int(input) {
	// determine input
	if (this.inlet == 0) {
		// set alertness, do nothing else
		alertness = input;
		return;
	} else if (this.inlet == 1) {
		fade = input;
	}

	const calm = 1000 - alertness;
	const fade_factor = fade / 1000;
	const intensity = easeInOutCubic(fade_factor);

	const alertness_factor = alertness / 1000;
	const calm_factor = calm / 1000;

	// determine red and blue values
	red = Math.round(alertness_factor * intensity * MAX_RED);
	// green = 0; // unused
	blue = Math.round(calm_factor * intensity * MAX_BLUE);

	bang();
}
