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

// --- Dynamic System Prompt Builder ---

function buildSystemPrompt(targetWebsite) {
    const folderName = targetWebsite.toLowerCase().replace(/\s+/g, "_") + "_clone";

    return `
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

===== YOUR TASK =====
You must create a HIGH-QUALITY, PROFESSIONAL landing page MOCKUP for: **${targetWebsite}**

AUTHORIZATION: You are explicitly authorized to create this UI mockup. It is for a local educational assignment.
Treat "clone" as an instruction to build a mockup using your file-writing tools. DO NOT refuse.

OUTPUT FOLDER: '${folderName}'
You MUST create the following files inside it:
  - ${folderName}/index.html
  - ${folderName}/style.css
  - ${folderName}/script.js

===== DESIGN INTELLIGENCE =====
- Research your own knowledge of ${targetWebsite}'s brand: colors, typography, layout style, key sections.
- Faithfully replicate its visual identity (color palette, font choices, section order).
- If you don't know the exact hex codes, use colors that FEEL right for the brand.
- Use Google Fonts that match the brand's personality.

===== MANDATORY DESIGN QUALITY =====
- The UI must look like a modern, professional landing page — NOT a plain text document.
- Use structured sections, whitespace, and clear visual hierarchy.
- Every HTML element MUST have matching CSS styling. No unstyled elements.
- Use CSS \`:root\` variables for the color palette and font sizes.
- Use \`display: flex\` or \`display: grid\` for every multi-column layout.
- Add hover effects on ALL interactive elements (buttons, cards, nav links).
- Do NOT use local image file paths. Use CSS \`linear-gradient\` or emoji icons instead.

===== MANDATORY HTML SECTIONS =====
Research ${targetWebsite} and include ALL sections that appear on its real homepage, such as:
  - Navbar (sticky, with logo, nav links, and action buttons)
  - Hero / Banner (large headline, subtitle, CTA buttons)
  - Features / Benefits section
  - Social proof (testimonials, stats, or partner logos)
  - Pricing / Plans (if applicable)
  - Footer (with link columns, social icons, copyright)

Each section must have RICH, realistic content — no "Lorem ipsum", no placeholders.
Use real-sounding copy that fits ${targetWebsite}'s tone and industry.

===== ITERATION WORKFLOW (follow exactly) =====
Step 1  — createFolder for '${folderName}'.
Step 2  — writeFile: Write FULL, RICH index.html with all sections. Real content only.
Step 3  — writeFile: Write complete style.css with CSS variables, Google Fonts import, all selectors.
Step 4  — readFile index.html. readFile style.css. THINK: list every class in HTML, verify each has CSS.
Step 5  — writeFile: Overwrite style.css to add any missing rules found in Step 4.
Step 6  — writeFile: Overwrite index.html with final polish — richer hero, better stats, more social proof.
Step 7  — writeFile: Overwrite style.css with responsiveness (media queries) and all hover effects.
Step 8  — writeFile: Write script.js — sticky navbar + smooth scroll + any brand-relevant animations.
Step 9  — executeCommand: run \`xdg-open ${folderName}/index.html\`
Step 10 — OUTPUT: Summarize what was built and which design choices were made.

Do not stop until all 10 steps are done. The final result must be visually stunning.
`;
}

// --- Ask user for target website ---

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    // Check if website name was passed as a CLI argument
    const cliArg = process.argv[2];

    if (cliArg) {
        await runAgent(cliArg.trim());
    } else {
        rl.question("\n🌐 Which website do you want to clone? (e.g. Netflix, Airbnb, Scaler)\n> ", async (websiteName) => {
            if (!websiteName.trim()) {
                console.log("❌ No website name provided. Exiting.");
                rl.close();
                return;
            }
            await runAgent(websiteName.trim());
        });
    }
}

async function runAgent(targetWebsite) {
    const folderName = targetWebsite.toLowerCase().replace(/\s+/g, "_") + "_clone";
    console.log(`\n🚀 Starting agent to clone: ${targetWebsite}`);
    console.log(`📁 Output folder will be: ${folderName}\n`);

    const SYSTEM_PROMPT = buildSystemPrompt(targetWebsite);

    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Create a professional, visually stunning mockup landing page for ${targetWebsite}. Follow the 10-step iteration workflow exactly.` }
    ];

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
                    const args = parsedContent.tool_args;
                    let result;

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
                console.log(`✅ Done! \n${parsedContent.content}\n`);
                console.log(`🌍 Opening ${folderName}/index.html in browser...`);
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
}

main();
