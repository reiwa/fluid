import { weight } from './weigth'
import { calcInnerProduct } from './utils'

function calcPressureExplicit () {
	const { nPcl, bucket } = this

	const a = this.soundVelocity * this.soundVelocity / this.n0Laplacian
	for (let i = 0; i < nPcl; ++i) {
		if (this.typ[i] != this.GHOST) {
			let ni = 0.0
			for (let n = bucket.othFst[i], j = bucket.othPcl[n]; n <= bucket.othLst[i]; j = bucket.othPcl[++n]) {
				const xDst = this.pos[j * 2] - this.pos[i * 2]
				const yDst = this.pos[j * 2 + 1] - this.pos[i * 2 + 1]
				const dst2 = xDst * xDst + yDst * yDst
				if (dst2 < this.riLaplacian2) {
					if (this.typ[j] != this.GHOST) {
						const dist = Math.sqrt(dst2)
						const w = weight(dist, this.riLaplacian)
						ni += w
					}
				}
			}
			let mi = this.fluidDensity
			this.prs[i] = (ni > this.n0Laplacian) ? (ni - this.n0Laplacian) * a * mi : 0
		}
	}
}

function calcPressureImplicit () {
	const { nPcl } = this

	calNumberDensity.call(this)

	// ↓ ディリクレ境界条件
	const state = new Int8Array(nPcl)

	// ↓ ポアソン方程式の右辺 ベクトル
	const sourceTerm = new Float64Array(nPcl)

	// ↓ ポアソン方程式の左辺 係数行列
	const coefficientMatrix = new Float64Array(nPcl * nPcl)

	setSourceTerm.call(this, sourceTerm)

	setCoefficientMatrix.call(this, coefficientMatrix, state)

	calcPoisson.call(this, sourceTerm, coefficientMatrix, state)
}

function calNumberDensity () {
	const { bucket } = this

	for (let i = 0; i < this.nPcl; ++i) {
		// ↓ 粒子数密度を初期化する
		this.dns[i] = 0.0
		if (this.typ[i] == this.GHOST) continue
		// ↓ 近傍粒子の探索
		for (let n = bucket.othFst[i], j = bucket.othPcl[n]; n <= bucket.othLst[i]; j = bucket.othPcl[++n]) {
			if (this.typ[j] == this.GHOST) continue
			const xij = this.pos[j * 2] - this.pos[i * 2]
			const yij = this.pos[j * 2 + 1] - this.pos[i * 2 + 1]
			const dst2 = Math.pow(xij, 2) + Math.pow(yij, 2)
			// ↓ 影響半径内の粒子のみ計算
			if (dst2 < this.riDensity2) {
				let dst = Math.sqrt(dst2)
				this.dns[i] += weight(dst, this.riDensity)
			}
		}
	}
}

function setSourceTerm (sourceTerm) {
	const { nPcl } = this

	// ↓ 緩和係数
	let gamma = this.relaxationCoffecientPressure
	for (let i = 0; i < nPcl; ++i) {
		// ↓ ついでにポアソン方程式の解:圧力を初期化する
		this.prs[i] = 0.0
		let beta = this.dnsThresholdRatio
		sourceTerm[i] = 0.0
		if (this.dns[i] < beta * this.n0NumberDensity) {
			sourceTerm[i] = 0.0
		} else {
			sourceTerm[i] =
				gamma
				* (1.0 / (this.dt * this.dt))
				* ((this.dns[i] - this.n0NumberDensity) / this.n0NumberDensity)
		}
	}
}

function setCoefficientMatrix (coefficientMatrix, state) {
	const { nPcl, bucket } = this

	const NOT = 0
	const CONNECT = 1
	const CHECK = 2

	// ↓ ポアソン方程式の左辺:係数行列を初期化する
	for (let i = 0; i < nPcl; ++i) {
		for (let j = 0; j < nPcl; ++j) coefficientMatrix[i * nPcl + j] = 0.0
	}

	// ↓ 境界条件の判定
	const flag = new Int8Array(nPcl)

	// ↓ ディリクレ境界条件を設定
	for (let i = 0; i < nPcl; ++i) {
		let beta = this.dnsThresholdRatio
		if (this.typ[i] == this.GHOST || this.typ[i] == this.DUMMY) {
			state[i] = this.GHOST
			flag[i] = this.GHOST
		} else if (this.dns[i] < beta * this.n0NumberDensity) {
			state[i] = this.SURFACE
			flag[i] = CONNECT
		} else {
			state[i] = this.INNER
			flag[i] = NOT
		}
	}

	let fin
	do {
		fin = false
		for (let i = 0; i < nPcl; ++i) {
			if (flag[i] == CONNECT) {
				for (let n = bucket.othFst[i], j = bucket.othPcl[n]; n <= bucket.othLst[i]; j = bucket.othPcl[++n]) {
					if (this.typ[j] != this.DUMMY) {
						if (flag[j] == NOT) {
							const xij = this.pos[j * 2] - this.pos[i * 2]
							const yij = this.pos[j * 2 + 1] - this.pos[i * 2 + 1]
							const dst2 = Math.pow(xij, 2) + Math.pow(yij, 2)
							if (dst2 < this.riLaplacian2) {
								flag[j] = CONNECT
							}
						}
					}
				}
				flag[i] = CHECK
				fin = true
			}
		}
	} while (fin)

	// ↓ ディリクレ境界条件をもたない流体に対して例外処理をおこなう
	for (let i = 0; i < nPcl; ++i) {
		if (flag[i] == NOT) {
			coefficientMatrix[i * nPcl + i] = 2.0 * coefficientMatrix[i * nPcl + i]
		}
	}

	// ↓ ラプラシアンモデルの係数 2d / λ0 n0
	const a = 2.0 * this.dimension / (this.lambda * this.n0Laplacian)
	// ↓ 係数行列の計算
	for (let i = 0; i < nPcl; ++i) {
		if (state[i] != this.INNER) continue
		for (let n = this.bucket.othFst[i], j = this.bucket.othPcl[n]; n <=
		this.bucket.othLst[i]; j = this.bucket.othPcl[++n]) {
			if (state[j] != this.GHOST) {
				let xij = this.pos[j * 2] - this.pos[i * 2]
				let yij = this.pos[j * 2 + 1] - this.pos[i * 2 + 1]
				let dst2 = Math.pow(xij, 2) + Math.pow(yij, 2)
				if (dst2 < this.riLaplacian2) {
					const dst = Math.sqrt(dst2)
					// ↓ ラプラシアンモデル
					const coefficient = a * weight(dst, this.riLaplacian) / this.fluidDensity
					coefficientMatrix[i * nPcl + j] = -1.0 * coefficient
					coefficientMatrix[i * this.nPcl + i] += coefficient
				}
			}
		}
		// ↓ 流体の圧縮率の計算
		coefficientMatrix[i * nPcl + i] += (this.compressibility) / (this.dt * this.dt)
	}
}

function calcPoisson (sourceTerm, coefficientMatrix, state) {
	const { nPcl } = this

	let p = new Float64Array(nPcl)
	let r = new Float64Array(nPcl)
	let ax = new Float64Array(nPcl)
	let ap = new Float64Array(nPcl)

	// ↓ ax = matrix * x
	for (let i = 0; i < this.nPcl; ++i) {
		if (state[i] != this.INNER) continue
		let vxm = 0
		for (let j = 0; j < this.nPcl; ++j) {
			if (state[j] == this.GHOST) continue
			vxm += coefficientMatrix[i * this.nPcl + j] * this.prs[j]
		}
		ax[i] = vxm
	}

	for (let i = 0; i < this.nPcl; ++i) {
		if (state[i] != this.INNER) continue
		p[i] = sourceTerm[i] - ax[i]
		r[i] = p[i]
	}

	const limit = 20
	for (let iter = 1; iter < limit; ++iter) {
		for (let i = 0; i < this.nPcl; ++i) {
			if (state[i] != this.INNER) continue
			let vxm = 0
			for (let j = 0; j < this.nPcl; ++j) {
				if (state[j] == this.GHOST) continue
				vxm += coefficientMatrix[i * this.nPcl + j] * p[j]
			}
			ap[i] = vxm
		}
		let alpha = calcInnerProduct(this.nPcl, p, r) / calcInnerProduct(this.nPcl, p, ap)
		for (let i = 0; i < this.nPcl; ++i) {
			if (state[i] != this.INNER) continue
			this.prs[i] += alpha * p[i]
			r[i] += -alpha * ap[i]
		}
		// ↓ Σ (0 - n-1) |x[i]|
		let norm = 0
		for (let i = 0; i < this.nPcl; ++i) {
			if (state[i] != this.INNER) continue
			norm += Math.abs(r[i])
		}
		const eps = 1.0e-6
		if (norm < eps) break
		// ↓ EPS < error
		let beta = -calcInnerProduct(this.nPcl, r, ap) / calcInnerProduct(this.nPcl, p, ap)
		for (let i = 0; i < this.nPcl; i++) {
			if (state[i] != this.INNER) continue
			p[i] = r[i] + beta * p[i]
		}
	}
}

const calcPressure = {
	implicit: calcPressureImplicit,
	explicit: calcPressureExplicit
}

export { calcPressure }
