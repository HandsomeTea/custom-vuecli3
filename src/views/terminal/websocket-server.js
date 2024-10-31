const { WebSocketServer } = require('ws');
const pty = require('node-pty');

const port = 3403;
const wss = new WebSocketServer({ port, path: '/ws/devicemgr/v1/terminal' });

wss.on('listening', () => {
	const { path, port } = wss.options;

	// eslint-disable-next-line no-console
	console.log(`websocket server is running on ws://localhost:${port}${path}`);
});

wss.on('connection', (ws, req) => {
	// eslint-disable-next-line no-console
	ws.on('error', console.error);

	const query = req.url.split('?')[1].split('&').map((item) => {
		const [key, value] = item.split('=');

		return { [key]: value };
	}).reduce((acc, cur) => {
		return { ...acc, ...cur };
	}, {});

	// eslint-disable-next-line no-console
	console.log(`get connected data: ${JSON.stringify(query, null, 3)}`);
	let term = null;

	if (!query.password) {
		term = pty.spawn('ssh', [`${query.user}@${query.host}`, '-p', query.port, '-o', 'StrictHostKeyChecking=no'], { cols: parseInt(query.cols) || 80 });
	} else {
		term = pty.spawn('sshpass', ['-p', query.password, 'ssh', `${query.user}@${query.host}`, '-p', query.port, '-o', 'StrictHostKeyChecking=no'], { cols: parseInt(query.cols) || 80 });
	}

	term.onData(data => {
		ws.send(data);
	});

	ws.on('message', data => {
		term.write(data);
	});

	ws.on('close', () => {
		term.kill();
		term = null;
		// eslint-disable-next-line no-console
		console.log(`${query.host} closed.`);
	});
});
