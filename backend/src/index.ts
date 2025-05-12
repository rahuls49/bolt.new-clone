require("dotenv").config();
import OpenAI from 'openai';
import { getSystemPrompt } from './prompt/prompts';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENAI_API_KEY,
    //   defaultHeaders: {
    //     'HTTP-Referer': 'http://localhost', // Optional. Site URL for rankings on openrouter.ai.
    //     'X-Title': 'Localhost Dev Server', // Optional. Site title for rankings on openrouter.ai.
    //   },
});

const reactBasePrompt = "";

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

main().catch(console.error);