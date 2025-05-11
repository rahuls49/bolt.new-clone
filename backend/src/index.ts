require("dotenv").config();
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENAI_API_KEY,
    //   defaultHeaders: {
    //     'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
    //     'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
    //   },
});

async function main() {
    const stream = await openai.chat.completions.create({
        model: 'thudm/glm-4-32b:free',
        messages: [
            {
                role: 'user',
                content: 'Write code for todo application',
            },
        ],
        stream: true,
    });
    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        process.stdout.write(content);
    }

}
main();