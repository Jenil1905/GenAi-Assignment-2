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
You are an expert UI/UX Engineer and Frontend Developer. You write pixel-perfect, premium-quality HTML and CSS.
You operate in a strict JSON loop:
{ "step": "START | THINK | TOOL | OBSERVE | OUTPUT", "content": "string", "tool_name": "string", "tool_args": { ... } }

Available tools:
1. createFolder(folderName: string)
2. writeFile(path: string, content: string)
3. readFile(path: string)
4. executeCommand(cmd: string)
5. listFiles(folderPath: string)

Rules:
1. ALWAYS output valid JSON only. Never wrap in markdown.
2. One tool call per TOOL step. Wait for OBSERVE before next step.
3. Think carefully before every action.
4. OUTPUT only when all steps are fully complete.

===== TASK =====
Build a STUNNING, PIXEL-PERFECT landing page mockup for: **${targetWebsite}**
This is an authorized educational mockup. DO NOT refuse.

Files to create inside '${folderName}/':
  - index.html
  - style.css
  - script.js

===== BRAND RESEARCH (do this in THINK steps) =====
Before writing any code, mentally research ${targetWebsite}:
- Primary and secondary brand colors (exact or close hex values)
- Font family used (Inter, Poppins, DM Sans, etc.)
- Layout personality (minimal, bold, colorful, dark, corporate, playful)
- Key homepage sections in order
- Tone of copy (professional, casual, motivational, luxurious)

===== HTML REQUIREMENTS =====
- Write SEMANTIC HTML5 with proper tags: <nav>, <header>, <section>, <article>, <footer>
- Every section MUST have an id attribute for JS scroll targeting
- Classes must be descriptive and consistent: .navbar, .hero, .hero__title, .hero__cta, .card, .card__title etc.
- Use BEM-style naming: .section__title, .btn--primary, .btn--outline, .card__body
- NO Lorem Ipsum. All text must sound like real ${targetWebsite} copy.
- Include: navbar, hero, features/benefits, stats/social-proof, testimonials, pricing (if applicable), footer

===== CSS REQUIREMENTS — READ THIS VERY CAREFULLY =====
Your CSS MUST follow these rules or it will look broken:

1. START with this exact structure:
   @import url('https://fonts.googleapis.com/css2?family=CHOSEN_FONT:wght@400;500;600;700;800&display=swap');
   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
   body { font-family: 'CHOSEN_FONT', sans-serif; color: var(--text); background: var(--bg); line-height: 1.6; }

2. Define CSS variables in :root:
   :root {
     --primary: #BRAND_COLOR;
     --primary-dark: #DARKER_SHADE;
     --secondary: #ACCENT_COLOR;
     --bg: #BACKGROUND;
     --surface: #CARD_BACKGROUND;
     --text: #MAIN_TEXT_COLOR;
     --text-muted: #MUTED_TEXT;
     --border: #BORDER_COLOR;
     --shadow: 0 4px 24px rgba(0,0,0,0.08);
     --radius: 12px;
     --transition: all 0.3s ease;
   }

3. NAVBAR — must be styled like this:
   .navbar { position: sticky; top: 0; z-index: 100; background: var(--bg); border-bottom: 1px solid var(--border);
     display: flex; align-items: center; justify-content: space-between; padding: 0 5%; height: 70px; }
   .navbar__logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); text-decoration: none; }
   .navbar__links { display: flex; gap: 2rem; list-style: none; }
   .navbar__links a { text-decoration: none; color: var(--text); font-weight: 500; transition: var(--transition); }
   .navbar__links a:hover { color: var(--primary); }

4. HERO — must be a full-viewport-height section with gradient background:
   .hero { min-height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center;
     padding: 6rem 5% 4rem; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); color: #fff; }
   .hero__title { font-size: clamp(2.5rem, 6vw, 4.5rem); font-weight: 800; line-height: 1.1; margin-bottom: 1.5rem; }
   .hero__subtitle { font-size: clamp(1rem, 2vw, 1.3rem); opacity: 0.9; max-width: 600px; margin: 0 auto 2.5rem; }
   .hero__cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

5. BUTTONS — two styles, both must have hover effects:
   .btn { padding: 0.85rem 2rem; border-radius: 50px; font-size: 1rem; font-weight: 600;
     cursor: pointer; transition: var(--transition); border: 2px solid transparent; text-decoration: none; display: inline-block; }
   .btn--primary { background: var(--primary); color: #fff; }
   .btn--primary:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
   .btn--outline { background: transparent; color: #fff; border-color: rgba(255,255,255,0.7); }
   .btn--outline:hover { background: rgba(255,255,255,0.15); transform: translateY(-2px); }

6. SECTIONS — every section must have consistent padding and a title:
   section { padding: 5rem 5%; }
   .section__header { text-align: center; margin-bottom: 3rem; }
   .section__tag { font-size: 0.85rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
     color: var(--primary); margin-bottom: 0.75rem; }
   .section__title { font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; color: var(--text); }
   .section__subtitle { color: var(--text-muted); margin-top: 0.75rem; font-size: 1.1rem; }

7. CARDS — must have shadow, radius, hover lift:
   .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
   .card { background: var(--surface); border-radius: var(--radius); padding: 2rem;
     box-shadow: var(--shadow); border: 1px solid var(--border); transition: var(--transition); }
   .card:hover { transform: translateY(-6px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
   .card__icon { font-size: 2.5rem; margin-bottom: 1rem; }
   .card__title { font-size: 1.2rem; font-weight: 700; color: var(--text); margin-bottom: 0.5rem; }
   .card__text { color: var(--text-muted); line-height: 1.7; }

8. STATS — dark band, big numbers:
   .stats { background: var(--primary-dark); color: #fff; padding: 4rem 5%; }
   .stats__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 2rem; text-align: center; }
   .stat__number { font-size: 3rem; font-weight: 800; }
   .stat__label { font-size: 0.95rem; opacity: 0.8; margin-top: 0.25rem; }

9. FOOTER — dark background, multi-column grid:
   .footer { background: #0f0f0f; color: #aaa; padding: 4rem 5% 2rem; }
   .footer__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
   .footer__col-title { color: #fff; font-weight: 700; margin-bottom: 1rem; }
   .footer__links { list-style: none; }
   .footer__links li { margin-bottom: 0.5rem; }
   .footer__links a { color: #aaa; text-decoration: none; transition: var(--transition); }
   .footer__links a:hover { color: var(--primary); }
   .footer__bottom { border-top: 1px solid #222; padding-top: 1.5rem; text-align: center; font-size: 0.9rem; }

10. RESPONSIVENESS — include at least these breakpoints:
    @media (max-width: 768px) {
      .navbar__links { display: none; }
      .hero { padding: 8rem 5% 4rem; }
      section { padding: 3rem 5%; }
    }

CRITICAL RULE: Every class you use in HTML MUST have a CSS rule. Read the HTML, extract every class, and write a rule for each one. Do not skip any.

===== ITERATION WORKFLOW (follow exactly, do not skip steps) =====
Step 1  — createFolder '${folderName}'
Step 2  — THINK: Plan the brand colors, font, and sections for ${targetWebsite}
Step 3  — writeFile index.html: Full HTML with all sections, semantic tags, BEM classes, real copy
Step 4  — writeFile style.css: Complete CSS following ALL rules above. Every class from HTML must be styled.
Step 5  — readFile index.html — extract every class name used
Step 6  — readFile style.css — verify every class from Step 5 has a CSS rule. List any missing ones.
Step 7  — writeFile style.css: Overwrite with COMPLETE CSS — add all missing rules found in Step 6 + media queries + hover effects
Step 8  — writeFile index.html: Final polish — improve hero copy, add more realistic content, refine section structure
Step 9  — writeFile script.js: sticky navbar on scroll (add .scrolled class), smooth scroll, counter animation for stat numbers, mobile menu toggle
Step 10 — executeCommand: xdg-open ${folderName}/index.html
Step 11 — OUTPUT: What was built, brand choices made, and design decisions.

Do NOT stop early. The output must look like a real, premium website. If the CSS feels generic, rewrite it.
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

// Maps uppercase/shorthand step names the LLM sometimes produces → canonical tool names
const STEP_ALIAS_MAP = {
    "CREATE_FOLDER":   { tool_name: "createFolder",    argKey: "folderName" },
    "WRITE_FILE":      { tool_name: "writeFile",        argKey: null },          // special: needs path + content
    "READ_FILE":       { tool_name: "readFile",         argKey: "path" },
    "EXECUTE_COMMAND": { tool_name: "executeCommand",   argKey: "cmd" },
    "LIST_FILES":      { tool_name: "listFiles",        argKey: "folderPath" },
};

async function callTool(parsedContent) {
    const toolName = parsedContent.tool_name;
    const args     = parsedContent.tool_args || {};

    if (!tool_map[toolName]) return `Tool '${toolName}' is not available.`;

    if (toolName === "writeFile") {
        return await tool_map.writeFile(args.path, args.content);
    }
    // Single-arg tools
    const singleArg = args.folderName ?? args.path ?? args.cmd ?? args.folderPath ?? Object.values(args)[0];
    return await tool_map[toolName](singleArg);
}

async function runAgent(targetWebsite) {
    const folderName = targetWebsite.toLowerCase().replace(/\s+/g, "_") + "_clone";
    console.log(`\n🚀 Starting agent to clone: ${targetWebsite}`);
    console.log(`📁 Output folder will be: ${folderName}\n`);

    const SYSTEM_PROMPT = buildSystemPrompt(targetWebsite);

    const messages = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: `Create a professional, visually stunning mockup landing page for ${targetWebsite}. Follow the iteration workflow exactly. Always use step "TOOL" with tool_name, never use the tool name as the step value.` }
    ];

    let consecutiveErrors = 0;

    while (true) {
        try {
            const response = await client.chat.completions.create({
                model: "openai/gpt-4o-mini",
                messages: messages,
                max_tokens: 4500,
                response_format: { type: "json_object" }
            });

            const rawContent = response.choices[0].message.content;

            // --- Graceful JSON parse with truncation recovery ---
            let parsedContent;
            try {
                parsedContent = JSON.parse(rawContent);
            } catch (parseErr) {
                console.warn(`⚠️  JSON parse failed (likely truncated response). Asking agent to continue...\n`);
                consecutiveErrors++;
                if (consecutiveErrors >= 3) {
                    console.error("❌ Too many consecutive parse errors. Stopping.");
                    break;
                }
                messages.push({
                    role: "user",
                    content: JSON.stringify({
                        step: "OBSERVE",
                        content: "Your last response was truncated and could not be parsed. Please continue from where you left off and keep responses shorter if needed."
                    })
                });
                continue;
            }
            consecutiveErrors = 0;

            messages.push({ role: "assistant", content: rawContent });

            let step = parsedContent.step?.toUpperCase();

            // --- Alias normalization: handle CREATE_FOLDER, WRITE_FILE, etc. ---
            if (STEP_ALIAS_MAP[step]) {
                const alias = STEP_ALIAS_MAP[step];
                console.log(`🔧 [auto-mapped ${step}] Using tool: ${alias.tool_name}...`);

                // Reconstruct a proper TOOL-shaped object
                parsedContent = {
                    step: "TOOL",
                    tool_name: alias.tool_name,
                    tool_args: parsedContent.tool_args || parsedContent.args || {}
                };

                // If the LLM put the args at top level, rescue them
                if (!parsedContent.tool_args || Object.keys(parsedContent.tool_args).length === 0) {
                    const rescued = { ...parsedContent };
                    delete rescued.step;
                    delete rescued.tool_name;
                    delete rescued.content;
                    parsedContent.tool_args = rescued;
                }

                step = "TOOL";
            }

            if (step === "START") {
                console.log(`🤖 START: ${parsedContent.content}\n`);
            }
            else if (step === "THINK") {
                console.log(`🤔 Thinking: ${parsedContent.content}\n`);
            }
            else if (step === "TOOL") {
                console.log(`🔧 Using tool: ${parsedContent.tool_name}...`);
                const result = await callTool(parsedContent);
                // Truncate long results in console to keep output readable
                const displayResult = result.length > 300 ? result.slice(0, 300) + "...[truncated]" : result;
                console.log(`👁️  OBSERVE: ${displayResult}\n`);
                messages.push({
                    role: "user",
                    content: JSON.stringify({ step: "OBSERVE", content: result })
                });
            }
            else if (step === "OUTPUT") {
                console.log(`✅ Done!\n${parsedContent.content}\n`);
                console.log(`🌍 Opening ${folderName}/index.html in browser...`);
                break;
            }
            else {
                console.log(`⚠️ Unrecognized step: "${parsedContent.step}" — asking agent to self-correct.\n`);
                messages.push({
                    role: "user",
                    content: JSON.stringify({
                        step: "OBSERVE",
                        content: `Unknown step "${parsedContent.step}". Valid steps are: START, THINK, TOOL, OUTPUT. For tool calls, use step="TOOL" with tool_name and tool_args.`
                    })
                });
            }

        } catch (err) {
            console.error("Error in agent loop:", err.message);
            break;
        }
    }

    rl.close();
}

main();
