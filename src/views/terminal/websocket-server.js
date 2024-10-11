const { WebSocketServer } = require('ws');
const pty = require('node-pty');

const port = 3403;
const wss = new WebSocketServer({ port }, { log: true });
let term = null;

wss.on('connection', function (ws) {
	// eslint-disable-next-line no-console
	console.log('connected');
	// eslint-disable-next-line no-console
	ws.on('error', console.error);

	term = pty.spawn('bash', ['--login']);
	term.on('data', function (data) {
		ws.send(data);
	});

	ws.on('message', function message(data) {
		// eslint-disable-next-line no-console
		console.log('received: %s', data);
		term.write(data);
	});

	ws.on('close', function () {
		term.kill();
	});
});
