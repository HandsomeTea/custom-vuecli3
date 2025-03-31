const { WebSocketServer } = require('ws');
const OpenAI = require('openai');

const port = 3423;
const wss = new WebSocketServer({ port, path: '/ws/ai/audio' });
const modelMap = {
	gemini: 'gemini-2.0-flash'
};
const apiKeyMap = {
	gemini: ''
};
const apiMap = {
	gemini: 'https://generativelanguage.googleapis.com/v1beta/openai'
};

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

		if (params.method === 'analysisAudioWithAi') {
			// const params = {
			//     "method": "chatWithAi",
			//     "data": {
			//         "ai": "gemini",
			//         "messages": [{ "role": "user", "content": "你好" }, { "role": "assistant", "content": "nihao" }]
			//     }
			// };
			const stream = await ws.aiClient.chat.completions.create({
				messages: params.data.messages,
				model: modelMap[params.data.ai],
				stream: true
			});

			for await (const chunk of stream) {
				ws.send(chunk.choices[0]?.delta?.content || '');
				process.stdout.write(chunk.choices[0]?.delta?.content || '');
			}
			ws.send('&&&end&&&');
		} else if (params.method === 'switchChat') {
			// const params = {
			//     "method": "switchChat",
			//     "data": {
			//         "ai": "gemini"
			//     }
			// }
			ws.aiClient = new OpenAI({
				apiKey: apiKeyMap[params.data.ai],
				baseURL: apiMap[params.data.ai]
			});
			ws.send('&&&switch-chat-success&&&');
		} else if (params.method === 'uoloadAudio') {

		}
	});
});
