function calcPosition () {
	for (let i = 0; i < this.nPcl; ++i) {
		if (this.typ[i] !== this.FLUID) continue
		this.vel[i * 2] += this.acc[i * 2] * this.dt
		this.vel[i * 2 + 1] += this.acc[i * 2 + 1] * this.dt
		this.pos[i * 2] += this.vel[i * 2] * this.dt
		this.pos[i * 2 + 1] += this.vel[i * 2 + 1] * this.dt
		this.acc[i * 2] = this.acc[i * 2 + 1] = 0.0
	}
}

function calcPositionSecond () {
	for (let i = 0; i < this.nPcl; ++i) {
		if (this.typ[i] != this.FLUID) continue
		this.vel[i * 2] += this.acc[i * 2] * this.dt
		this.vel[i * 2 + 1] += this.acc[i * 2 + 1] * this.dt
		this.pos[i * 2] += this.acc[i * 2] * this.dt * this.dt
		this.pos[i * 2 + 1] += this.acc[i * 2 + 1] * this.dt * this.dt
		this.acc[i * 2] = this.acc[i * 2 + 1] = 0.0
	}
}

export { calcPosition, calcPositionSecond }
