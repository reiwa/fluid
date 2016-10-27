const particleDistance = 0.025

const eps = 0.01 * particleDistance

const DUMMY = 3
const FLUID = 0
const WALL = 1

const nx = (1.0 / particleDistance) + 5
const ny = (0.6 / particleDistance) + 5

const min = { x: 0.0, y: 0.0 }
const max = { x: 1.0, y: 0.5 }

/**
 * 1 1                 1 1
 * 3 1                 1 3
 * 3 1 0 0 0 0 0 0 0 0 1 3
 * 3 1 0 0 0 0 0 0 0 0 1 3
 * 3 1 1 1 1 1 1 1 1 1 1 3
 * 3 3 3 3 3 3 3 3 3 3 3 3
 */

const sample = []

for (let i = -4; i < nx; ++i) for (let j = -4; j < ny; ++j) {
	const x = particleDistance * i
	const y = particleDistance * j
	const z = 0.0

	// ↓ exclusion
	if (x < min.x - 4 * particleDistance + eps || max.x + 4 * particleDistance + eps < x) continue
	if (y < min.y - 4 * particleDistance + eps || max.y + 4 * particleDistance + eps < y) continue

	// ↓ dummy
	let type = DUMMY

	// ↓ wall
	if (x <= max.x + (2 * particleDistance) + eps && min.x - (2 * particleDistance) + eps < x)
		if (y <= 0.6 + eps && min.y - (2 * particleDistance) + eps < y) {
			type = WALL
		}

	// ↓ wall
	if (min.x - (4 * particleDistance) + eps < x && x <= max.x + (4 * particleDistance) + eps)
		if (0.6 - (2 * particleDistance) + eps < y && y <= 0.6 + eps) {
			type = WALL
		}

	// ↓ blank (1 > x > 0, y > 0)
	if (x <= max.x + eps && eps < x && eps < y) {
		// ↓ fluid
		if (eps < x && x <= 0.4 + eps)
			if (eps < y && y <= 0.40 + eps) {
				type = FLUID
				sample.push([type, x, y, z, 0, 0, 0, 0, 0])
			}
	} else {
		// ↓ wall or dummy
		sample.push([type, x, y, z, 0, 0, 0, 0, 0])
	}
}

const fill = sample

export { sample, fill }
