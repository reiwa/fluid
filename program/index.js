import { initParameter } from './initParameter'
import { initBucket } from './initBucket'
import { resetBucket } from './resetBucket'
import { calcViscosity } from './calcViscosity'
import { calcPosition, calcPositionSecond } from './calcPosition'
import { calcCollision } from './calcCollision'
import { calcPressure } from './calcPressure'
import { calcPressureGradient } from './calcPressureGradient'

class Fluid {
	GHOST = -1
	FLUID = 0
	WALL = 1
	DUMMY = 3
	GHOST = -1
	INNER = 0
	SURFACE = 1
	nPcl
	elapsedTime
	dimension
	particleDistance
	dt
	stepInterval
	terminationTime
	xMin
	xMax
	yMin
	yMax
	zMin
	zMax
	gravity
	riDensity
	riDensity2
	riGradient
	riGradient2
	riLaplacian
	riLaplacian2
	collisionDistance
	collisionDistance2
	dnsThresholdRatio
	coefficientRestitution
	compressibility
	relaxationCoffecientPressure
	cfl
	eps
	kinematicViscosity
	fluidDensity
	n0NumberDensity
	n0Gradient
	n0Laplacian
	soundVelocity
	lambda
	typ
	pos
	vel
	acc
	prs
	dns
	bucket = {
		dInv: null,
		nx: null,
		ny: null,
		nxy: null,
		fst: null,
		lst: null,
		nxt: null,
		nOth: null,
		othPcl: null,
		othFst: null,
		othLst: null
	}
	config = {
		implicit: false
	}
	func = []

	constructor () {
		this.calcViscosity = calcViscosity.bind(this)
		this.calcPosition = calcPosition.bind(this)
		this.calcCollision = calcCollision.bind(this)
		this.calcPressure = {
			implicit: calcPressure.implicit.bind(this),
			explicit: calcPressure.explicit.bind(this)
		}
		this.calcPressureGradient = calcPressureGradient.bind(this)
		this.calcPositionSecond = calcPositionSecond.bind(this)
	}

	set set (config) {
		const keys = Object.keys(this.config)
		for (let name in config) {
			if (keys.indexOf(name) !== -1) {
				this.config[name] = config[name]
			}
		}
	}

	get init () {
		return data => {
			this.pcl = data
			initParameter.call(this)
			initBucket.call(this)
			return
		}
	}

	set init (req) {
		this.init.call(this, req)
	}

	get run () {
		setInterval(() => {
			this.func.forEach(func => func.call(this))
			resetBucket.call(this)
			calcViscosity.call(this)
			calcPosition.call(this)
			calcCollision.call(this)
			if (this.config.implicit) {
				calcPressure.implicit.call(this)
			} else {
				calcPressure.explicit.call(this)
			}
			calcPressureGradient.call(this)
			calcPositionSecond.call(this)
		}, 15)
		return this
	}

	get with () {
		return fn => {
			this.func.push(fn)
			return this
		}
	}

	set with (req) {
		this.with.call(this, req)
	}
}

export { Fluid }
