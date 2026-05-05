# AI Agent CLI Tool

A conversational CLI agent that acts like an AI software engineer right in your terminal. It listens to your instructions, reasons through the steps, and generates actual files on your system using Node.js tools.

This project specifically demonstrates an agent capable of generating a Scaler Academy website clone based on a single prompt.

## Setup Instructions

1. **Install Dependencies**
   Make sure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Open the `.env` file and add your OpenAI API Key:
   ```env
   OPENAI_API_KEY=your_actual_api_key_here
   ```

## How to Run

Start the agent in your terminal:
```bash
npm start
```
or 
```bash
node agent.js
```

## How it Works
The agent works in an autonomous loop using the following framework:
- **START**: Acknowledges the user's prompt.
- **THINK**: Breaks down the problem and plans its next action.
- **TOOL**: Uses built-in node tools (like `createFolder`, `writeFile`, `readFile`) to create the output.
- **OBSERVE**: Checks the result of the tool execution to decide if it succeeded.
- **OUTPUT**: Completes the task and provides a final response to the user.
