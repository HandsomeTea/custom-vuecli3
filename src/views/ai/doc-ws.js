const { GoogleGenerativeAI } = require('@google/generative-ai');
const { WebSocketServer } = require('ws');

const port = 3424;
const wss = new WebSocketServer({ port, path: '/ws/ai/doc' });
const googleAI = new GoogleGenerativeAI('');
const gemini = googleAI.getGenerativeModel({
	model: 'gemini-1.5-flash'
});


wss.on('listening', () => {
	const { path, port } = wss.options;

	// eslint-disable-next-line no-console
	console.log(`websocket server is running on ws://localhost:${port}${path}`);
}).on('close', ws => {
	// eslint-disable-next-line no-console
	console.log('wss server closed!');
	ws.close();
}).on('connection', ws => {
	// eslint-disable-next-line no-console
	console.log('ws connected!');

	ws.on('close', () => {
		// eslint-disable-next-line no-console
		console.log('ws closed!');
	});

	ws.on('message', async data => {
		const params = JSON.parse(data.toString());

		if (params.method === 'analysisDocumentWithAi') {
			if (params.data.ai === 'gemini') {
				// const params = {
				//     "method": "analysisDocumentWithAi",
				//     "data": {
				//         "ai": "gemini",
				//         "content": [
				//             { "text": "Hi, This is a picture of me. Can you add a llama next to me?" },
				//             {
				//                 "inlineData": {
				//                     "mimeType": 'application/pdf',
				//                     "data": "base64Image-xxx"
				//                 }
				//             }
				//         ]
				//     }
				// };

				try {
					const response = await gemini.generateContentStream(params.data.content);

					for await (const chunk of response.stream) {
						process.stdout.write(chunk.text());
						ws.send(chunk.text());
					}
				} catch (error) {
					// eslint-disable-next-line no-console
					console.log(error);
					ws.send('服务异常！');
				}
			}
			ws.send('&&&end&&&');
		} else if (params.method === 'switchChat') {
			if (params.data.ai === 'gemini') { }
			ws.send('&&&switch-chat-success&&&');
		}
	});
});
