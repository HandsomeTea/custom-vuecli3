const { GoogleGenerativeAI } = require('@google/generative-ai');
const { WebSocketServer } = require('ws');

const port = 3422;
const wss = new WebSocketServer({ port, path: '/ws/ai/image' });

const googleAI = new GoogleGenerativeAI('');
const gemini = googleAI.getGenerativeModel({
	model: 'gemini-2.0-flash-exp-image-generation',
	generationConfig: {
		responseModalities: ['Text', 'Image']
	}
});

wss.on('listening', () => {
	const { path, port } = wss.options;

	// eslint-disable-next-line no-console
	console.log(`websocket server is running on ws://localhost:${port}${path}`);
}).on('close', ws => {
	ws.close();
	// eslint-disable-next-line no-console
	console.log('ws closed!');
}).on('connection', ws => {
	// eslint-disable-next-line no-console
	console.log('ws connected!');
	ws.on('message', async data => {
		const params = JSON.parse(data.toString());

		if (params.method === 'createImageWithAi') {
			if (params.data.ai === 'gemini') {
				// const params = {
				//     "method": "createImageWithAi",
				//     "data": {
				//         "ai": "gemini",
				//         "content": [
				//             { "text": "Hi, This is a picture of me. Can you add a llama next to me?" },
				//             {
				//                 "inlineData": {
				//                     "mimeType": 'image/png',
				//                     "data": "base64Image-xxx"
				//                 }
				//             }
				//         ]
				//     }
				// };
				try {
					const response = await gemini.generateContent(params.data.content);

					for (const part of response.response.candidates[0].content.parts) {
						if (part.text) {
							ws.send(`##text##:${part.text}`);
							ws.send('&&&text-end&&&');
						} else if (part.inlineData) {
							let imageData = part.inlineData.data;

							for (let s = 0; ; s++) {
								const data = imageData.substring(0, 30);

								imageData = imageData.substring(30);
								ws.send(`##image##:${data}`);
								if (!imageData) {
									ws.send('&&&image-end&&&');
									break;
								}
							}
						}
					}
				} catch (error) {
					//
				}
			}
			ws.send('&&&end&&&');
		} else if (params.method === 'switchChat') {
			if (params.data.ai === 'gemini') { }
			ws.send('&&&switch-chat-success&&&');
		}
	});
});
