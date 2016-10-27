function resetBucket () {
	const { nPcl } = this

	for (let i = 0; i < this.bucket.nxy; ++i) {
		this.bucket.fst[i] = -1
		this.bucket.lst[i] = -1
	}

	for (let i = 0; i < nPcl; ++i) {
		this.bucket.nxt[i] = -1
		if (this.typ[i] == this.GHOST) continue
		// ↓ 粒子の存在するxy方向のバケット番号
		let ix = parseInt((this.pos[i * 2] - this.xMin) * this.bucket.dInv)
		let iy = parseInt((this.pos[i * 2 + 1] - this.yMin) * this.bucket.dInv)
		calcException.call(this, i, ix, iy)
		if (this.typ[i] == this.GHOST) continue
		// ↓ バケットの番号
		let ib = iy * this.bucket.nx + ix
		// ↓ バケットibの粒子を取り出す
		let j = this.bucket.lst[ib]
		// ↓ 現時点での最後の粒子を保存
		this.bucket.lst[ib] = i
		// ↓ 取り出した粒子が存在しない(-1)ならbFastに保存
		if (j == -1) {
			this.bucket.fst[ib] = i
		} else {
			this.bucket.nxt[j] = i
		}
	}

	// ↓ 探索総数
	this.bucket.nOth = 0

	for (let i = 0; i < nPcl; ++i) {
		if (this.typ[i] == this.GHOST) continue
		this.bucket.othFst[i] = this.bucket.nOth
		let n = 0
		let ix = parseInt((this.pos[i * 2] - this.xMin) * this.bucket.dInv)
		let iy = parseInt((this.pos[i * 2 + 1] - this.yMin) * this.bucket.dInv)
		for (let jy = iy - 1; iy + 1 >= jy; ++jy) {
			for (let jx = ix - 1; ix + 1 >= jx; ++jx) {
				let j = this.bucket.fst[jy * this.bucket.nx + jx]
				while (j != -1) {
					if (j != i) {
						this.bucket.othPcl[this.bucket.nOth] = j
						this.bucket.nOth += 1
						n += 1
					}
					j = this.bucket.nxt[j]
				}
			}
		}
		this.bucket.othLst[i] = (0 < n) ? this.bucket.nOth - 1 : 0
	}
}

function calcException (i, ix, iy) {
	if (this.pos[i * 2] < this.xMin) {
		this.typ[i] = this.GHOST
		this.prs[i] = this.vel[i * 2] = this.vel[i * 2 + 1] = this.vel[i * 2 + 2] = 0.0
	} else if (this.xMax < this.pos[i * 2]) {
		this.typ[i] = this.GHOST
		this.prs[i] = this.vel[i * 2] = this.vel[i * 2 + 1] = this.vel[i * 2 + 2] = 0.0
	} else if (this.pos[i * 2 + 1] < this.yMin) {
		this.prs[i] = this.vel[i * 2] = this.vel[i * 2 + 1] = this.vel[i * 2 + 2] = 0.0
	} else if (this.yMax < this.pos[i * 2 + 1]) {
		this.typ[i] = this.GHOST
		this.prs[i] = this.vel[i * 2] = this.vel[i * 2 + 1] = this.vel[i * 2 + 2] = 0.0
	} else if (ix < 0 || this.bucket.nx < ix) { // ← 粒子がバケット空間の外に存在する場合プログラム終了
		throw new Error('exit')
	} else if (iy < 0 || this.bucket.ny < iy) {
		throw new Error('exit')
	}
}

export { resetBucket }
