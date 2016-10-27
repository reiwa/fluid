function weight (distance, re) {
	let result
	if (re <= distance) {
		result = 0.0
	} else {
		result = (re / distance) - 1.0
	}
	return result
}

export { weight }
