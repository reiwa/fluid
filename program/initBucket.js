function initBucket () {
	const { nPcl } = this

	// ↓ 影響半径 ラプラシアンモデル
	const r = this.riLaplacian // 2.1 ~ 3.1
	// ↓ バケット1辺の長さ
	const lenBkt = r * (1.0 + this.cfl)
	this.bucket.dInv = 1.0 / lenBkt
	// ↓ 計算領域内の3方向のバケット数
	this.bucket.nx = parseInt((this.xMax - this.xMin) * this.bucket.dInv)
	this.bucket.ny = parseInt((this.yMax - this.yMin) * this.bucket.dInv)
	this.bucket.nxy = this.bucket.nx * this.bucket.ny
	// ↓ バケットに保存された先頭の粒子の番号
	this.bucket.fst = new Int32Array(this.bucket.nxy)
	// ↓ バケットに保存された最後の粒子の番号
	this.bucket.lst = new Int32Array(this.bucket.nxy)
	// ↓ バケットに保存された次の粒子の番号
	this.bucket.nxt = new Int32Array(nPcl)
	// ↓ 粒子iに対する周辺の粒子の番号
	this.bucket.othPcl = new Uint32Array(nPcl * nPcl)
	// ↓ 粒子iに対する周囲の粒子が保管されているindex
	this.bucket.othFst = new Uint32Array(nPcl)
	this.bucket.othLst = new Uint32Array(nPcl)
}

export { initBucket }
