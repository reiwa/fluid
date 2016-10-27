const { resolve } = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const config = require(resolve('webpack/webpack.config'));

module.exports = {
	ui: {
		port: 3001,
		weinre: {
			port: 8080
		}
	},
	files: [
		resolve('webpack/*'),
		resolve('webpack/*/*'),
		resolve('docs/*'),
		resolve('docs/*/*'),
		resolve('docs/*/*/*')
	],
	watchOptions: {},
	server: resolve('docs'),
	proxy: false,
	port: 4040,
	middleware: [
		webpackDevMiddleware(webpack(config), {
			publicPath: config.output.publicPath,
			stats: {
				colors: true
			}
		})
	],
	serveStatic: [],
	ghostMode: {
		clicks: false,
		scroll: false,
		forms: {
			submit: true,
			inputs: true,
			toggles: true
		}
	},
	logLevel: 'info',
	logPrefix: 'BS',
	logConnections: false,
	logFileChanges: true,
	logSnippet: true,
	rewriteRules: false,
	open: 'local',
	browser: 'default',
	xip: false,
	hostnameSuffix: false,
	reloadOnRestart: false,
	notify: true,
	scrollProportionally: true,
	scrollThrottle: 0,
	scrollRestoreTechnique: 'window.name',
	scrollElements: [],
	scrollElementMapping: [],
	reloadDelay: 0,
	reloadDebounce: 0,
	plugins: [],
	injectChanges: true,
	startPath: null,
	minify: false,
	host: null,
	codeSync: true,
	timestamps: true,
	clientEvents: [
		'scroll',
		'scroll:element',
		'input:text',
		'input:toggles',
		'form:submit',
		'form:reset',
		'click'
	],
	socket: {
		socketIoOptions: {
			log: false
		},
		socketIoClientConfig: {
			reconnectionAttempts: 50
		},
		path: '/browser-sync/socket.io',
		clientPath: '/browser-sync',
		namespace: '/browser-sync',
		clients: {
			heartbeatTimeout: 5000
		}
	},
	tagNames: {
		less: 'link',
		scss: 'link',
		css: 'link',
		jpg: 'img',
		jpeg: 'img',
		png: 'img',
		svg: 'img',
		gif: 'img',
		js: 'script'
	}
};
