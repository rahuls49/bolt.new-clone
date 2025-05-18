require("dotenv").config();
import { ChatOpenAI } from "@langchain/openai";
import OpenAI from 'openai';
import { BASE_PROMPT, getSystemPrompt } from './prompt/prompts';
import { reactBasePrompt, nodeBasePrompt } from './prompt/defaults/basePrompts';
import express from "express";
import cors from "cors";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts"
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { MESSAGE_TYPE } from "./types/message-type";
import { ChatGroq } from "@langchain/groq";


const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENAI_API_KEY,
    //   defaultHeaders: {
    //     'HTTP-Referer': 'http://localhost', // Optional. Site URL for rankings on openrouter.ai.
    //     'X-Title': 'Localhost Dev Server', // Optional. Site title for rankings on openrouter.ai.
    //   },
});

const app = express();

app.use(express.json());
app.use(cors(
    // {
    // origin: "http://localhost:5173"
    // }
))

app.get('/', (req, res) => {
    res.send("Backend is up!")
})

app.post("/template", async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await openai.chat.completions.create({
            model: 'thudm/glm-4-32b:free',
            messages: [
                {
                    role: "system",
                    content: "Based on the User Prompt, Return 'node' or 'react' in response, only return a single word nothing extra, If there is any ambiguity take react as default"
                },
                {
                    role: "system",
                    content: prompt
                },
            ],
            max_completion_tokens: 50
        });
        const tech = response?.choices[0]?.message?.content?.trim();
        switch (tech?.toLocaleLowerCase()) {
            case 'node':
                res.status(200).json({
                    prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                    uiPrompts: [nodeBasePrompt]
                })
                return;
                break;
            case 'react':
                res.status(200).json({
                    prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
                    uiPrompts: [reactBasePrompt]
                })
                return;
                break;
            default:
                res.status(403).json({ message: "Invalid Request" })
        }
    } catch (error) {
        res.status(500).json({ message: error })
        console.error('Error:', error);
    }

})


app.post("/chat", async (req, res) => {
    const { messages } = req.body;
    try {
        // Uncomment this, in case you want to use OpenRouter for Code Generation

        //     const llm = new ChatOpenAI(
        // {
        //     configuration: {
        //         baseURL: 'https://openrouter.ai/api/v1',
        //     },
        //     model: "thudm/glm-4-32b:free",
        //     // model: "agentica-org/deepcoder-14b-preview:free",
        //     temperature: 0,
        //     // maxRetries: 2,
        //     // streaming: true,
        //     apiKey: process.env.OPENAI_API_KEY,

        //     // other params...
        //     });


        // Using Groq to generate code
        const llm = new ChatGroq({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0,
            maxTokens: undefined,
            maxRetries: 2,
            // other params...
        });
        const messagesForLLM = [];


        const systemPromptContent = getSystemPrompt();
        messagesForLLM.push(new SystemMessage(systemPromptContent));
        messages.forEach((msg: MESSAGE_TYPE) => {
            messagesForLLM.push(new HumanMessage({ content: msg.content }));
        })

        const response = await llm.invoke(messagesForLLM);
        console.log({ response })
        res.status(200).json({ message: response?.content });
    } catch (error) {
        res.status(500).json({ message: error });
        console.error('Error:', error);
    }
})

app.get('/favicon.ico', (req:any, res:any) => res.status(204).end());



if (process.env.NODE_ENV === "dev") {
    app.listen(3000, () => {
        console.log(`Backend Server is Listening on http://localhost:3000 🚀`)
    })
}

export default app;

// This function is for reference only
/*
async function main() {
    try {
        const stream = await openai.chat.completions.create({
            model: 'thudm/glm-4-32b:free',
            messages: [
                {
                    role: "system",
                    content: getSystemPrompt()
                },
                {
                    role: 'user',
                    content: `For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.
                    By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.
                    Use icons from lucide-react for logos.
                    Use stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in imageTags.`,
                },
                {
                    role: 'user',
                    content: `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
                },
                {
                    role: 'user',
                    content: 'content: "<running_commands>\n</running_commands>\n\n<bolt_file_modifications>\n<file path=\".gitignore\" type=\"removed\"></file>\n<file path=\"eslint.config.js\" type=\"removed\"></file>\n<file path=\"index.html\" type=\"removed\"></file>\n<file path=\"package-lock.json\" type=\"removed\"></file>\n<file path=\"package.json\" type=\"removed\"></file>\n<file path=\"postcss.config.js\" type=\"removed\"></file>\n<file path=\"tailwind.config.js\" type=\"removed\"></file>\n<file path=\"tsconfig.app.json\" type=\"removed\"></file>\n<file path=\"tsconfig.json\" type=\"removed\"></file>\n<file path=\"tsconfig.node.json\" type=\"removed\"></file>\n<file path=\"vite.config.ts\" type=\"removed\"></file>\n<file path=\".bolt/prompt\" type=\"removed\"></file>\n<file path=\"src/App.tsx\" type=\"removed\"></file>\n<file path=\"src/index.css\" type=\"removed\"></file>\n<file path=\"src/main.tsx\" type=\"removed\"></file>\n<file path=\"src/vite-env.d.ts\" type=\"removed\"></file>\n</bolt_file_modifications>\n\nCreate a todo app"',
                },
            ],
            stream: true,
        });

        for await (const chunk of stream) {
            process.stdout.write(chunk.choices[0]?.delta?.content || '');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
*/

// main().catch(console.error);