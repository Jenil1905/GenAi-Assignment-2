# 🤖 AI Website Clone Agent

An autonomous CLI agent that clones **any website** you name. Just tell it which site you want, and it reasons through the task step-by-step — creating a professional, visually polished landing page mockup using HTML, CSS, and JavaScript.

## ✨ What It Does

- Accepts **any website name** (Netflix, Airbnb, Scaler, Zomato, etc.)
- Autonomously researches the brand's identity (colors, fonts, layout, sections)
- Generates a fully styled, multi-section landing page mockup
- Iterates and self-audits to ensure quality before finishing
- Opens the result in your browser automatically

## 🚀 Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` file (never commit this!):
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

## ▶️ How to Run

### Interactive Mode (prompts you for a website name)
```bash
node agent.js
```
```
🌐 Which website do you want to clone? (e.g. Netflix, Airbnb, Scaler)
> Netflix
```

### CLI Argument Mode (pass the name directly)
```bash
node agent.js "Netflix"
node agent.js "Airbnb"
node agent.js "Zomato"
node agent.js "Scaler"
```

The output is saved to a folder named `<website>_clone/` containing:
- `index.html` — full landing page markup
- `style.css` — complete, premium styling
- `script.js` — interactivity (sticky nav, smooth scroll, animations)

## 🧠 How the Agent Works

The agent runs an autonomous loop using a strict reasoning framework:

| Step | Description |
|------|-------------|
| **START** | Acknowledges the target website |
| **THINK** | Reasons about the brand, design decisions |
| **TOOL** | Calls a tool (`createFolder`, `writeFile`, `readFile`, etc.) |
| **OBSERVE** | Inspects the tool result and plans next step |
| **OUTPUT** | Summarizes what was built and opens the browser |

The agent iterates through **10 structured steps** — writing the HTML, styling it, auditing for missing CSS, polishing, and adding JS — before declaring the task complete.

## 📁 Project Structure

```
GenAi-Assignment2/
├── agent.js          # Main autonomous agent
├── package.json
├── .env              # API key (not committed)
├── .gitignore
├── netflix_clone/    # Example output
│   ├── index.html
│   ├── style.css
│   └── script.js
└── scaler_clone/     # Example output (Scaler Academy)
    ├── index.html
    ├── style.css
    └── script.js
```
