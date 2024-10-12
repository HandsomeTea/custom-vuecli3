const { WebSocketServer } = require('ws');
const pty = require('node-pty');

const port = 3403;
const wss = new WebSocketServer({ port });
let term = null;

wss.on('connection', ws => {
	// eslint-disable-next-line no-console
	console.log('connected');
	// eslint-disable-next-line no-console
	ws.on('error', console.error);

	term = pty.spawn('sshpass', ['-p', 'sensetime', 'ssh', 'autotester@10.4.12.146', '-p', '22']);
	term.onData(data => {
		ws.send(data);
	});

	ws.on('message', data => {
		// eslint-disable-next-line no-console
		console.log('received: %s', data);
		term.write(data);
	});

	ws.on('close', () => {
		// eslint-disable-next-line no-console
		console.log('close');
		term.kill();
		term = null;
	});
});
