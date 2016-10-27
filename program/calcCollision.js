function calcCollision () {
	const { nPcl, bucket } = this

	// ↓ 修正後の粒子の速度
	let velocityNext = new Float64Array(nPcl * 2)

	for (let i = 0; i < nPcl; ++i) {
		if (this.typ[i] != this.FLUID) continue
		// ↓ 粒子の速度
		let ixVelocity = this.vel[i * 2]
		let iyVelocity = this.vel[i * 2 + 1]
		// ↓ 粒子数密度
		let mi = this.fluidDensity
		// ↓ 近傍粒子の探索
		for (let n = bucket.othFst[i], j = bucket.othPcl[n]; n <= bucket.othLst[i]; j = bucket.othPcl[++n]) {
			let restitution = this.coefficientRestitution
			let xij = this.pos[j * 2] - this.pos[i * 2]
			let yij = this.pos[j * 2 + 1] - this.pos[i * 2 + 1]
			let dst2 = Math.pow(xij, 2.0) + Math.pow(yij, 2.0)
			// ↓ 影響半径内の粒子かどうか判定
			if (dst2 <= this.collisionDistance2) {
				let dst = Math.sqrt(dst2)
				// ↓ 斥力
				let force = (ixVelocity - this.vel[j * 2]) * (xij / dst) + (iyVelocity - this.vel[j * 2 + 1]) * (yij / dst)
				// ↓ 斥力が0以下、引力の場合は計算しない
				if (force <= 0.0) continue
				// ↓ 粒子jの粒子数密度
				let mj = this.fluidDensity
				// ↓ 反発係数を用いて斥力を修正
				force *= (1.0 + restitution) * mi * mj / (mi + mj)
				ixVelocity -= (force / mi) * (xij / dst)
				iyVelocity -= (force / mi) * (yij / dst)
			}
		}
		velocityNext[i * 2] = ixVelocity
		velocityNext[i * 2 + 1] = iyVelocity
	}

	// ↓ 修正した速度から位置を修正
	for (let i = 0; i < nPcl; ++i) {
		if (this.typ[i] != this.FLUID) continue
		this.pos[i * 2] += (velocityNext[i * 2] - this.vel[i * 2]) * this.dt
		this.pos[i * 2 + 1] += (velocityNext[i * 2 + 1] - this.vel[i * 2 + 1]) * this.dt
		this.vel[i * 2] = velocityNext[i * 2]
		this.vel[i * 2 + 1] = velocityNext[i * 2 + 1]
	}
}

export { calcCollision }
