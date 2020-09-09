
/**
 * @file smoothactivity.js
 * @copyright Delano Flipse 2020
 * Smooth transition between levels of activity/alertness
 * 
 * INLETS:
 * [ sensor_input, global_behaviour ]
 * 
 * sensor_input     = [ 0 | 1 ]     when equal to 1, trigger alertness
 * global_behaviour = [ 0 - 1000 ]  the incoming global behaviour
 * 
 * OUTLETS:
 * [ alertness ]
 * 
 * alertness        = [ 0 - 1000]   the level of alertness
 */

// declare inlets and outlets
inlets = 2;
outlets = 1;

// input variables
var global_behaviour = 0;

// script variables
var state_index = -1;
var state_time = 0;

// constants
var GLOBAL_INFLUENCE = 50;
var STATES = [
	// waking up state
	{ start: 0, end: 1000, duration: 800 },
	// active state
	{ start: 1000, end: 1000, duration: 3000 },
	// cooldown state
	{ start: 1000, end: 0, duration: 3000 },
];

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
 * Calculate a new alertness level.
 */
function bang() {
	// update timing
	getDelta();

	// global_behaviour sets the minimum alertness from [ 0 - GLOBAL_INFLUENCE ]
	const global_factor = global_behaviour / 1000;
	const global_value = GLOBAL_INFLUENCE * global_factor;

	// if we are not in a state, we are dormant
	if (state_index == -1) {
		// output only the global value
		outlet(0, global_value);
		return;
	}

	const current_state = STATES[state_index];

	// the state value transitions from start to end,
	// depending on the current state time
	const state_difference = current_state.end - current_state.start;
	const state_progress = state_time / current_state.duration;
	const state_value = current_state.start + state_difference * state_progress;

	// determine outlet output
	// clipped [ 0 - 1000 ]
	const alertness_output_value = GLOBAL_INFLUENCE * global_factor + state_value;
	const alertness_output = Math.min(alertness_output_value, 1000);
	outlet(0, alertness_output);

	state_time += delta;
	// if we reach the end of the current state
	if (state_time > current_state.duration) {
		// proceed to next state & reset time
		state_index++;
		state_time = 0;
		
		// no new state to proceed to?
		if (state_index >= STATES.length) {
			// go dormant
			state_index = -1;
			return;
		}
	}
}

/** Incoming input */
function msg_int(input) {
	// check which outlet, set value
	if (this.inlet == 1) {
		global_behaviour = input;
		return;
	}

	// if input == 0, there is no activity, so ignore.
	if (input == 0) {
		return;
	}

	// update state
	switch (state_index) {
		case -1:
			// if dormant, go to the wake up state
			state_index = 0;
			state_time = 0;
			break;
		
		case 0:
			// already waking up, do nothing
			break;
		case 1:
			// if we are in the active state, reset it.
			state_time = 0;
			break;

		case 2:
			// a little more complex;
			// if we were cooling down, jump to the waking up state
			// and for a smooth transition, convert the state_time
			state_index = 0;

			const state_difference_factor = STATES[0].duration / STATES[2].duration;
			const new_time = STATES[0].duration - state_time * state_difference_factor;
			state_time = Math.round(new_time);
		default:
			break;
	}
}
