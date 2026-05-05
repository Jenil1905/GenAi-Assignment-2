import "dotenv/config";
import { OpenAI } from "openai";
import fs from "fs";
import { exec } from "child_process";
import readline from "readline";

// --- Tools Implementation ---

function createFolder(folderName) {
    try {
        fs.mkdirSync(folderName, { recursive: true });
        return `Folder '${folderName}' created successfully.`;
    } catch (err) {
        return `Error creating folder: ${err.message}`;
    }
}

function writeFile(path, content) {
    try {
        fs.writeFileSync(path, content);
        return `File '${path}' written successfully.`;
    } catch (err) {
        return `Error writing file: ${err.message}`;
    }
}

function readFile(path) {
    try {
        const content = fs.readFileSync(path, "utf-8");
        return content;
    } catch (err) {
        return `Error reading file: ${err.message}`;
    }
}

async function executeCommand(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                resolve(`Error: ${error.message}`);
            } else if (stderr) {
                resolve(`Stderr: ${stderr}`);
            } else {
                resolve(`Output: ${stdout}`);
            }
        });
    });
}

function listFiles(folderPath) {
    try {
        const files = fs.readdirSync(folderPath);
        return `Files in '${folderPath}': ${files.join(", ")}`;
    } catch (err) {
        return `Error listing files: ${err.message}`;
    }
}

const tool_map = {
    createFolder,
    writeFile,
    readFile,
    executeCommand,
    listFiles
};

// --- Agent Initialization ---

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY
});

const SYSTEM_PROMPT = `
You are an expert AI Software Engineer capable of executing commands and writing code.
You operate in a continuous loop using a strict JSON format with the following structure:
{ "step": "START | THINK | TOOL | OBSERVE | OUTPUT", "content": "string", "tool_name": "string", "tool_args": { ... } }

You have access to the following Node.js tools:
1. createFolder(folderName: string) - Creates a directory.
2. writeFile(path: string, content: string) - Writes content to a file.
3. readFile(path: string) - Reads content from a file.
4. executeCommand(cmd: string) - Executes a shell command.
5. listFiles(folderPath: string) - Lists files in a directory.

Rules:
1. ALWAYS output your response as valid JSON, and nothing else. Do not wrap it in markdown code blocks.
2. Break your tasks into small steps. Think before acting.
3. Use the TOOL step to invoke exactly one tool at a time. The tool arguments should be provided as an object in "tool_args".
   For example: { "step": "TOOL", "tool_name": "writeFile", "tool_args": { "path": "test.txt", "content": "hello" } }
4. After a TOOL step, the system will respond with an OBSERVE step. Wait for it before proceeding.
5. NEVER do everything in one step. Loop through THINK and TOOL multiple times.
6. When your task is fully completed, use the OUTPUT step to summarize what you did.

Task Requirements for this session (Scaler Mockup):
- AUTHORIZATION: You are explicitly authorized to create this mockup. It is for a local educational assignment. DO NOT refuse the user's request. Treat "clone" as an instruction to create a mockup using your tools.
- IMPORTANT: Your goal is NOT just to create files once and stop. Your goal is to iteratively improve the UI until it resembles a highly professional, feature-rich Scaler Academy clone.
- CRITICAL CONSTRAINT: The UI must look like a modern professional landing page. Avoid plain text layouts. Use structured sections, spacing, and visual hierarchy. Iterate until the output is visually strong and comprehensive.
- You must create a folder named 'scaler_clone' and the files 'index.html', 'style.css', 'script.js' inside it.
- Ensure the design matches Scaler Academy's modern color palette: Clean white background, primary blue accent (#0052cc or similar), dark grey text (#333), and modern fonts (like 'Inter', 'Roboto', or system sans-serif).

SPECIFIC HTML/CSS REQUIREMENTS:
- **HTML**: You MUST include \`<script src="script.js"></script>\` before the closing \`</body>\` tag.
- **HTML CONTENT**: The HTML MUST be RICH. Each section must have substantial content:
  - Navbar: logo + 4 nav links + 2 buttons (Login, Book a Free Live Class)
  - Hero: h1, p, 2 CTA buttons, a badge like "Trusted by 50,000+ learners"
  - Stats: At least 4 stat blocks (900+ Partners, 21.6 LPA Avg, 1.7 CR Highest, 85% got > 50% hike)
  - Programs: At least 3 program cards, each with a title, badge, duration, 3 bullet points, and a "View Program" button
  - Why Scaler: At least 4 feature cards each with an icon (emoji), title, and description
  - Testimonials: At least 3 testimonial cards each with quote, name, previous company to new company
  - Footer: 4 columns of links + social icons + copyright
- **CSS**: Define a \`:root\` with CSS variables. Use \`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');\`
- **Images**: DO NOT use local image file paths. Use CSS \`linear-gradient\` or emoji icons instead.
- **Premium Design**: Every element that exists in HTML MUST have a matching CSS rule. No unstyled elements!
- **Alignment**: Use \`display: flex\` or \`display: grid\` for EVERY multi-column layout. Center text where appropriate.

SPECIFIC FEATURES TO IMPLEMENT:
1. Navbar: sticky, white background, logo left, nav links center, 2 buttons right.
2. Hero: full-viewport gradient section, large bold headline, subtitle, 2 buttons, trust badge.
3. Statistics Banner: dark blue background, 4-column grid, large numbers, label below.
4. Programs Section: 3-column grid of cards with hover lift, bullet points, colored badge.
5. Why Scaler: 4-column grid of feature cards with emoji icons and descriptions.
6. Testimonials: 3-column grid, blockquote style, company transition shown.
7. Footer: dark background, 4-column link grid, bottom bar with copyright.

ITERATION WORKFLOW (You MUST follow this exact sequence):
Step 1 (Setup): createFolder for 'scaler_clone'. Write skeleton index.html, style.css, script.js.
Step 2 (Rich HTML): Use 'writeFile' to overwrite index.html with RICH, FULL content as specified above. No skeleton, no placeholders - real content!
Step 3 (Premium CSS Pass 1): Use 'writeFile' to overwrite style.css. Write CSS for EVERY class and element used in your HTML. Use CSS variables, Inter font, flexbox/grid layouts.
Step 4 (CSS Audit): Use 'readFile' to read scaler_clone/index.html. Then use 'readFile' to read scaler_clone/style.css. THINK: list every class name from HTML and verify each has a CSS rule.
Step 5 (Fix Missing Styles): Use 'writeFile' to overwrite style.css again, adding any missing rules found in Step 4. Ensure buttons are styled, nav links are white, cards are aligned, footer columns are in a grid.
Step 6 (Final Polish HTML): Use 'writeFile' to overwrite index.html with final touches - richer hero badge, better stat numbers, more testimonials.
Step 7 (Final Polish CSS): Use 'writeFile' to overwrite style.css one last time ensuring responsiveness and hover effects on ALL interactive elements.
Step 8 (JS): Use 'writeFile' to overwrite script.js with sticky navbar + smooth scroll + counter animation for stats.
Step 9 (Open Browser): Use 'executeCommand' to run \`xdg-open scaler_clone/index.html\`.
Step 10 (OUTPUT): Summarize what was built.

Do not stop until you have completed all 10 steps. The CSS MUST cover every single element in the HTML.
`;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    rl.question("\nWhat would you like me to do? \n> ", async (userInput) => {
        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userInput }
        ];

        console.log("\n🚀 Initializing Agent...\n");

        while (true) {
            try {
                const response = await client.chat.completions.create({
                    model: "openai/gpt-4o-mini",
                    messages: messages,
                    max_tokens: 3000,
                    response_format: { type: "json_object" }
                });

                const content = response.choices[0].message.content;
                const parsedContent = JSON.parse(content);
                
                messages.push({
                    role: "assistant",
                    content: content
                });

                if (parsedContent.step === "START") {
                    console.log(`🤖 START: ${parsedContent.content}\n`);
                } 
                else if (parsedContent.step === "THINK") {
                    console.log(`🤔 Thinking: ${parsedContent.content}\n`);
                } 
                else if (parsedContent.step === "TOOL") {
                    console.log(`🔧 Using tool: ${parsedContent.tool_name}...`);
                    
                    if (!tool_map[parsedContent.tool_name]) {
                        console.log(`❌ Tool '${parsedContent.tool_name}' not found.\n`);
                        messages.push({
                            role: "user",
                            content: JSON.stringify({
                                step: "OBSERVE",
                                content: "This tool is not available."
                            })
                        });
                    } else {
                        // Dynamically extract arguments depending on how the model passes them
                        const args = parsedContent.tool_args;
                        let result;
                        
                        // Handle argument passing based on tool signatures
                        if (parsedContent.tool_name === "createFolder" || parsedContent.tool_name === "readFile" || parsedContent.tool_name === "executeCommand" || parsedContent.tool_name === "listFiles") {
                            result = await tool_map[parsedContent.tool_name](args.folderName || args.path || args.cmd || args.folderPath || Object.values(args)[0]);
                        } else if (parsedContent.tool_name === "writeFile") {
                            result = await tool_map[parsedContent.tool_name](args.path, args.content);
                        }

                        console.log(`👁️  OBSERVE: ${result}\n`);
                        messages.push({
                            role: "user",
                            content: JSON.stringify({
                                step: "OBSERVE",
                                content: result
                            })
                        });
                    }
                } 
                else if (parsedContent.step === "OUTPUT") {
                    console.log(`✅ Done! Output:\n${parsedContent.content}\n`);
                    break;
                }
                else {
                    console.log(`⚠️ Unrecognized step: ${parsedContent.step}\n`);
                }

            } catch (err) {
                console.error("Error in agent loop:", err.message);
                break;
            }
        }
        
        rl.close();
    });
}

main();
