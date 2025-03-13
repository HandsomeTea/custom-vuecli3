const { GoogleGenerativeAI } = require('@google/generative-ai');
const { WebSocketServer } = require('ws');

const genAI = new GoogleGenerativeAI('');
const port = 3421;
const wss = new WebSocketServer({ port, path: '/ws/ai/chat' });
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

wss.on('listening', () => {
	const { path, port } = wss.options;

	// eslint-disable-next-line no-console
	console.log(`websocket server is running on ws://localhost:${port}${path}`);
});
wss.on('connection', ws => {
	// eslint-disable-next-line no-console
	console.log('ws connected!');

	ws.on('message', async data => {
		const params = JSON.parse(data.toString());

		if (params.method === 'askai') {
			// const params = {
			//     "method": "askai",
			//     "data": {
			//         "ai": "gemini",
			//         "prompt": "你好"
			//     }
			// };
			if (params.data.ai === 'gemini') {
				const ask = params.data.prompt;
				const result = await ws.chat.sendMessageStream(ask);

				for await (const chunk of result.stream) {
					const chunkText = chunk.text();

					process.stdout.write(chunkText);
					ws.send(chunkText);
				}
				ws.send('&&&end&&&');
			}
		} else if (params.method === 'switchChat') {
			// const params = {
			//     "method": "switchChat",
			//     "data": {
			//         "ai": "gemini",
			//         "history": [{ role: "user", parts: [{ text: "你好" }] }]
			//     }
			// }
			const history = params.data.history;

			if (params.data.ai === 'gemini') {
				ws.chat = model.startChat({ history });
			}
		}
	});
});

wss.on('close', ws => {
	ws.close();
	// eslint-disable-next-line no-console
	console.log('ws closed!');
});
