import { Fluid } from 'fluid-program'
import { sample } from 'fluid-program/sample/simple'

let ctx = null
let canvas = null

void function main () {
	canvas = document.createElement('canvas')
	canvas.className = 'canvas'
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
	document.body.appendChild(canvas)
	ctx = canvas.getContext('2d')
	const fluid = new Fluid()
	fluid.set = { implicit: false }
	fluid.init = sample
	fluid.with = render
	fluid.run
}()

function render () {
	const { bucket } = this

	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.save()
	if (canvas.height < canvas.width) {
		const width = canvas.width - (canvas.width - canvas.height) / 2
		const height = canvas.height
		ctx.translate(width, height)
	} else {
		const width = canvas.width
		const height = canvas.height - (canvas.height - canvas.width) / 2
		ctx.translate(width, height)
	}
	ctx.rotate(Math.PI)
	ctx.strokeStyle = 'lightblue'
	const mh = (canvas.height < canvas.width ? canvas.height : canvas.width) / 10
	for (let i = 0; i < this.nPcl; ++i) {
		const x = this.pos[i * 2] * mh * 9 + mh
		const y = this.pos[i * 2 + 1] * mh * 9 + mh
		if (this.typ[i] === this.FLUID) {
			for (let n = bucket.othFst[i], j = bucket.othPcl[n]; n <= bucket.othLst[i]; j = bucket.othPcl[++n]) {
				if (this.typ[j] !== this.FLUID) continue
				const xij = this.pos[j * 2] - this.pos[i * 2]
				const yij = this.pos[j * 2 + 1] - this.pos[i * 2 + 1]
				const dst2 = Math.pow(xij, 2) + Math.pow(yij, 2)
				if (dst2 < this.riGradient2 / 2) {
					const nx = this.pos[j * 2] * mh * 9 + mh
					const ny = this.pos[j * 2 + 1] * mh * 9 + mh
					ctx.beginPath()
					ctx.moveTo(x, y)
					ctx.lineTo(nx, ny)
					ctx.stroke()
				}
			}
			ctx.fillStyle = 'dodgerblue'
			ctx.beginPath()
			ctx.arc(x, y, 2, 0, Math.PI * 2, true)
			ctx.fill()
		}
	}
	ctx.restore()
}
