
/**
 * @file smoothfade.js
 * @copyright Delano Flipse 2020
 * Smooth transition between levels of activity/alertness
 * 
 * INLETS:
 * [ alertness ]
 * 
 * alertness        = [ 0 - 1000]   the level of alertness
 * 
 * OUTLETS:
 * [ fade_value, fade_speed ]
 * 
 * fade_value       = [ 0 - 1000]   the fade brightness
 * fade_speed       = (variable)    the fade speed
 */

// declare inlets and outlets
inlets = 1;
outlets = 2;

// rate constants (in ms)
var FAST_RATE = 150;
var SLOW_RATE = 1200;
var RATE_DIFF = SLOW_RATE - FAST_RATE;

// input variables
var alertness = 0;

// script variables
var fade_value = 0;
var fade_speed = 0;
var fade_direction = 1;

// timing variables
var delta = 0;
var last_time = new Date().getTime();

/**
 * Get and set the time difference since the last call.
 * This allows for smooth transitions, independant of bang interval.
 */
function getDelta() {
	const now = new Date().getTime();
	delta = now - last_time;
	last_time = now;
}

/**
 * Update bang.
 * Calculate a new fade level.
 */
function bang() {
	// update timing
	getDelta();

	// calculate the desired frequency
	const alertness_factor = alertness / 1000;
	const rate = SLOW_RATE - RATE_DIFF * alertness_factor;

	// apply velocity to fade
	fade_value = Math.round(fade_value + fade_speed * delta);

	// define new fade_speed
	fade_speed = (fade_direction * 1000) / rate;

	if (fade_value >= 1000 && fade_direction > 0) {
		// if we reached the right limit, bounce
		fade_direction *= -1;
		fade_value = 1000;
	} else if (fade_value <= 0 && fade_direction < 0) {
		// if we reached the left limit, bounce
		fade_direction *= -1;
		fade_value = 0;
	} else if (fade_value <= 0) {
		// if something weird happens, clip the values
		fade_value = 0;
	} else if (fade_value >= 1000) {
		fade_value = 1000;
	}

	// output values
	outlet(0, fade_value);
	outlet(1, fade_speed);
}

/** Incoming input */
function msg_int(input) {
	// set alertness
	alertness = input;
}
