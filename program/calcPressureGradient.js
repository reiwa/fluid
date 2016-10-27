function calcPressureGradient () {
	const { nPcl, bucket } = this

	// ↓ 粒子の周辺の最小圧力
	let minPrs = new Float64Array(nPcl); // minimum pressure
	// ↓ グラディエントモデルの係数 2 / n0
	const dn = 2 / this.n0Gradient
	// ↓ 粒子iの周囲の最小の圧力を算出
	for (let i = 0; i < nPcl; ++i) {
		// ↓ ダミー粒子は圧力をもたない
		if (this.typ[i] != this.GHOST && this.typ[i] != this.DUMMY) {
			// ↓ 液体表面付近において液体表面の圧力より低い圧力が発生するのを防ぐ
			if (this.prs[i] < 0.0) this.prs[i] = 0.0
			minPrs[i] = this.prs[i]
			// ↓ 粒子iの近傍粒子jを探索
			for (let n = bucket.othFst[i], j = bucket.othPcl[n]; n <= bucket.othLst[i]; j = bucket.othPcl[++n]) {
				if (this.prs[j] < 0.0) this.prs[j] = 0.0
				const xij = this.pos[j * 2] - this.pos[i * 2]
				const yij = this.pos[j * 2 + 1] - this.pos[i * 2 + 1]
				const dst2 = Math.pow(xij, 2) + Math.pow(yij, 2)
				// ↓ 影響半径（グラディエントモデル）以下の粒子のみ計算
				if (dst2 < this.riGradient2) {
					// ↓ 近傍粒子の圧力を比較
					if (this.prs[j] < minPrs[i]) minPrs[i] = this.prs[j]
				}
			}
		}
		// ↓ 最小圧力から圧力勾配を算出
		if (this.typ[i] == this.FLUID) {
			// ↓ 係数（対角行列）
			let k = new Float64Array([
				1, 0,
				0, 1
			])
			// ↓ Σ = ((Pj - Pi) / (dist * dist)) * (rj - ri) * w
			let sigma_x = 0.0
			let sigma_y = 0.0
			for (let n = bucket.othFst[i], j = bucket.othPcl[n]; n <= bucket.othLst[i]; j = bucket.othPcl[++n]) {
				let xij = this.pos[j * 2] - this.pos[i * 2]
				let yij = this.pos[j * 2 + 1] - this.pos[i * 2 + 1]
				let dst2 = Math.pow(xij, 2) + Math.pow(yij, 2)
				if (dst2 < this.riGradient2) {
					let dst = Math.sqrt(dst2)
					let w = this.riGradient / dst - 1.0; // ← 重み
					// ↓ ((Pj - Pi) / (dist * dist))
					let pij = (this.prs[j] - minPrs[i]) / dst2
					sigma_x += xij * pij * w
					sigma_y += yij * pij * w
				}
			}
			// ↓ (d / n0) * Σ
			let dnm_x = k[0] * (dn * sigma_x) + k[1] * (dn * sigma_y)
			this.acc[i * 2 + 0] -= dnm_x / this.fluidDensity
			let dnm_y = k[2] * (dn * sigma_x) + k[3] * (dn * sigma_y)
			this.acc[i * 2 + 1] -= dnm_y / this.fluidDensity
		}
	}
}

export { calcPressureGradient }
