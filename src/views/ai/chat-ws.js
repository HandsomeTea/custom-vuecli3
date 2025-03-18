const { GoogleGenerativeAI } = require('@google/generative-ai');
const { WebSocketServer } = require('ws');

const googleAI = new GoogleGenerativeAI('');
const OpenAI = require('openai');

const port = 3421;
const wss = new WebSocketServer({ port, path: '/ws/ai/chat' });

const gemini = googleAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const deepseek = new OpenAI({
	baseURL: 'https://api.deepseek.com',
	apiKey: ''
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

		if (params.method === 'chatWithAi') {
			if (params.data.ai === 'gemini') {
				// const params = {
				//     "method": "chatWithAi",
				//     "data": {
				//         "ai": "gemini",
				//         "prompt": "你好"
				//     }
				// };
				const ask = params.data.prompt;
				const result = await ws.chat.sendMessageStream(ask);

				for await (const chunk of result.stream) {
					const chunkText = chunk.text();

					process.stdout.write(chunkText);
					ws.send(chunkText);
				}
			} else if (params.data.ai === 'deepseek') {
				// const params = {
				//     "method": "chatWithAi",
				//     "data": {
				//         "ai": "gemini",
				//         "messages": [{"role":"user", "content":"你好"},{"role":"system", "content":"nihao"}]
				//     }
				// };
				const stream = await deepseek.chat.completions.create({
					messages: params.data.messages,
					model: 'deepseek-chat',
					stream: true
				});

				for await (const chunk of stream) {
					ws.send(chunk.choices[0]?.delta?.content || '');
					process.stdout.write(chunk.choices[0]?.delta?.content || '');
				}
			}
			ws.send('&&&end&&&');
		} else if (params.method === 'switchChat') {
			if (params.data.ai === 'gemini') {
				// const params = {
				//     "method": "switchChat",
				//     "data": {
				//         "ai": "gemini",
				//         "history": [{ role: "user", parts: [{ text: "你好" }] }]
				//     }
				// }
				const history = params.data.history;

				ws.chat = gemini.startChat({ history });
			}
			ws.send('&&&switch-chat-success&&&');
		}
	});
});
