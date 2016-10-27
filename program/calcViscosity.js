import { weight } from './weigth'

function calcViscosity () {
	const { nPcl, bucket } = this

	let a =
		this.kinematicViscosity * (2.0 * this.dimension)
		/ (this.n0Laplacian * this.lambda);
	for (let i = 0; i < nPcl; ++i) {
		if (this.typ[i] === this.FLUID) {
			// ↓ 加速度を重力で初期化
			this.acc[i * 2] = 0; // ← x軸
			this.acc[i * 2 + 1] = this.gravity;
			// ↓ 粘性
			let viscosity_x = 0.0;
			let viscosity_y = 0.0;
			// ↓ 近傍粒子の探索
			for (let n = bucket.othFst[i], j = bucket.othPcl[n]; n <= bucket.othLst[i]; j = bucket.othPcl[++n]) {
				let xij = this.pos[j * 2] - this.pos[i * 2];
				let yij = this.pos[j * 2 + 1] - this.pos[i * 2 + 1];
				let dst2 = Math.pow(xij, 2.0) + Math.pow(yij, 2.0);
				// ↓ 影響半径内のみ計算
				if (dst2 < this.riLaplacian2) {
					let dst = Math.sqrt(dst2);
					let w = weight.call(this, dst, this.riLaplacian);
					// ↓ 粘性を修正
					viscosity_x += (this.vel[j * 2] - this.vel[i * 2]) * w;
					viscosity_y += (this.vel[j * 2 + 1] - this.vel[i * 2 + 1]) * w;
				}
			}
			this.acc[i * 2] += viscosity_x * a;
			this.acc[i * 2 + 1] += viscosity_y * a;
		} else {
			// ↓ 流体以外の加速度は零に設定
			this.acc[i * 2] = 0.0;
			this.acc[i * 2 + 1] = 0.0;
		}
	}
}

export { calcViscosity }
