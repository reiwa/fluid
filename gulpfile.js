const { resolve } =require('path')
const gulp = require('gulp')

// ↓ html
gulp.task('html', () => {
	const plumber = require('gulp-plumber')
	return gulp.src('html/*')
	.pipe(plumber())
	.pipe(gulp.dest('docs'))
})

gulp.task('html:watch', ['html'], () => {
	gulp.watch('html/*', ['html'])
})

// ↓ favicon
gulp.task('favicon', () => {
	const plumber = require('gulp-plumber')
	const favicons = require('gulp-favicons')
	gulp
	.src(resolve('favicon/logo.jpg'))
	.pipe(plumber())
	.pipe(favicons({
		appName: 'application name',
		appDescription: 'application description',
		developerName: 'oisiclemelonpan.com',
		developerURL: 'http://oisiclemelonpan.com',
		background: '#ffffff',
		path: '/favicons/',
		url: 'http://oisiclemelonpan.com',
		display: 'standalone',
		orientation: 'portrait',
		version: 1.0,
		logging: false,
		online: false,
		html: 'index.html',
		pipeHTML: true,
		replace: true
	}))
	.pipe(gulp.dest(resolve('docs/favicons')))
})

// ↓ browser-sync
gulp.task('browser-sync', () => {
	const browserSync = require('browser-sync')
	const config = require(resolve('bs-config.js'))
	browserSync(config)
})

// ↓ default
gulp.task('default', ['html', 'html:watch', 'browser-sync'])

// ↓ build
gulp.task('build', ['html', 'stylus'])
