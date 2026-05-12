const { WebSocketServer } = require('ws');
const OpenAI = require('openai');

const port = 3421;
const wss = new WebSocketServer({ port, path: '/ws/ai/chat' });
const modelMap = {
	gemini: 'gemini-2.0-flash',
	deepseek: 'deepseek-chat',
	chatgpt: 'gpt-4o'
};
const apiKeyMap = {
	gemini: '',
	deepseek: '',
	chatgpt: ''
};
const apiMap = {
	gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
	deepseek: 'https://api.deepseek.com',
	chatgpt: 'https://api.openai.com/v1'
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

		if (params.method === 'chatWithAi') {
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
				stream: true,
				...params.data.ai === 'deepseek' ? {
					thinking: { type: 'disabled' }, // enabled
					// reasoning_effort: 'high',  // 思考关闭时，不能设置reasoning_effort属性
					'extra_body': {
						'enable_search': true
					}
				} : {}
			});

			for await (const chunk of stream) {
				const result = {
					content: chunk.choices[0]?.delta?.content || '',
					reasoning: chunk.choices[0]?.delta?.reasoning_content || ''
				};

				ws.send(result.reasoning || result.content);
				process.stdout.write(result.reasoning || result.content);
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
		}
	});
});
