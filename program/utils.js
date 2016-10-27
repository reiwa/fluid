function calcInnerProduct (n, x, y) {
	let result = 0;
	for (let i = 0; i < n; ++i) {
		result += x[i] * y[i]
	}
	return result
}

export { calcInnerProduct }
