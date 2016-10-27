import { weight } from './weigth'

function initParameter () {
	// ↓ 経過時間 0.0s
	this.elapsedTime = 0.0

	// ↓ 解析領域の次元数
	this.dimension = 2

	// ↓ 平均粒子間距離
	this.particleDistance = 0.025

	// ↓ 時間刻み幅
	this.dt = 0.001

	// ↓ ファイルを書き出す間隔
	this.stepInterval = 20

	// ↓ 計算終了時間
	this.terminationTime = 2.0

	// ↓ 重力加速度
	this.gravity = -9.8

	// ↓ 自由表面の判定に用いる値
	this.dnsThresholdRatio = 0.97

	// ↓ 剛体衝突の反発係数
	this.coefficientRestitution = 0.2

	// ↓ 流体の圧縮率
	this.compressibility = 0.45E-9

	// ↓ 圧力計算の際の緩和係数
	this.relaxationCoffecientPressure = 0.2

	// ↓ CFL条件
	this.cfl = 0.1

	// ↓ 動粘性係数
	this.kinematicViscosity = 1.0E-6

	// ↓ 流体密度
	this.fluidDensity = 1000.0

	// ↓ 粒子密度の基準値
	this.n0NumberDensity = 0.0
	this.n0Gradient = 0.0
	this.n0Laplacian = 0.0

	// ↓ 音速
	this.soundVelocity = 22.0

	// ↓ 影響半径 for 粒子密度
	this.riDensity = 2.1 * this.particleDistance
	// ↓ 影響半径 for グラディエントモデル
	this.riGradient = 2.1 * this.particleDistance
	// ↓ 影響半径 for ラプラシアンモデル
	this.riLaplacian = 3.1 * this.particleDistance

	// ↓ 胴体判定を行うかどうかの判定に用いる距離
	this.collisionDistance = 0.5 * this.particleDistance

	// ↓ 距離の二乗 計算の短縮に用いる
	this.riDensity2 = Math.pow(this.riDensity, 2.0)
	this.riGradient2 = Math.pow(this.riGradient, 2.0)
	this.riLaplacian2 = Math.pow(this.riLaplacian, 2.0)
	this.collisionDistance2 = Math.pow(this.collisionDistance, 2.0)

	// 解析領域の最大値・最小値 (この領域を超えた粒子は除外)
	this.xMin = 0.0
	this.xMax = 1.0
	this.yMin = 0.0
	this.yMax = 1.0
	this.zMin = 0.0
	this.zMax = 1.0

	const nPcl = this.pcl.length

	this.nPcl = nPcl

	// ↓ 粒子の座標
	this.pos = new Float64Array(nPcl * 2); // position
	// ↓ 粒子の速度
	this.vel = new Float64Array(nPcl * 2) // velocity
	// ↓ 粒子の加速度
	this.acc = new Float64Array(nPcl * 2) // acceleration
	// ↓ 粒子の水圧
	this.prs = new Float64Array(nPcl); // pressure
	// ↓ 粒子の種類
	this.typ = new Int8Array(nPcl); // particleType
	// ↓ 粒子の密度
	this.dns = new Float64Array(nPcl); // density

	for (let i = 0; i < nPcl; ++i) {
		const pcl = this.pcl[i]
		this.typ[i] = pcl[0]
		this.pos[i * 2] = pcl[1]; // x
		this.pos[i * 2 + 1] = pcl[2]; // y
		this.vel[i * 2] = pcl[4]
		this.vel[i * 2 + 1] = pcl[5]
		this.acc[i * 2] = 0
		this.acc[i * 2 + 1] = 0
		this.prs[i] = pcl[7]
		this.dns[i] = pcl[8]
		if (this.xMin > pcl[1]) this.xMin = pcl[1]
		else if (pcl[1] > this.xMax) this.xMax = pcl[1]
		if (this.yMin > pcl[2]) this.yMin = pcl[2]
		else if (pcl[2] > this.yMax) this.yMax = pcl[2]
	}

	// ↓ 解析領域の拡張
	this.xMin -= this.particleDistance * 10; // 35
	this.xMax += this.particleDistance * 20; // 10

	this.yMin -= this.particleDistance * 10; // 35
	this.yMax += this.particleDistance * 20; // 25

	// ↓ ラプラシアンモデルのラムダ
	this.lambda = 0.0
	let xi = 0.0
	let yi = 0.0
	for (let iX = -4; iX < 5; ++iX) {
		for (let iY = -4; iY < 5; ++iY) {
			if (iX == 0 && iY == 0) continue
			let xj = this.particleDistance * iX
			let yj = this.particleDistance * iY
			let dst2 = Math.pow(xj - xi, 2.0) + Math.pow(yj - yi, 2.0)
			let dst = Math.sqrt(dst2)
			this.n0NumberDensity += weight(dst, this.riDensity)
			this.n0Gradient += weight(dst, this.riGradient)
			this.n0Laplacian += weight(dst, this.riLaplacian)
			this.lambda += dst2 * weight(dst, this.riLaplacian)
		}
	}

	this.lambda = this.lambda / this.n0Laplacian
}

export { initParameter }
