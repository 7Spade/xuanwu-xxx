# MCP Tools & Capabilities Registry

## 1. Sequential Thinking (`server-sequential-thinking`)
- **Trigger**: When I ask for a complex architectural change or a bug fix that involves multiple files.
- **Instruction**: ALWAYS use a structured "thinking process" before generating code to avoid edge cases.

## 2. Software Planning (`Software-planning-mcp`)
- **Trigger**: When I start a new feature or a complex task.
- **Instruction**: Proactively offer to break down the task into milestones and tasks using this tool.

## 3. Repo Context (`repomix`)
- **Trigger**: When you feel you lack enough context from the current files to answer correctly.
- **Instruction**: Ask me to run `npx repomix` to bundle the repository context for you.

## 4. UI Library (`shadcn`)
- **Trigger**: When I request a new UI component or a dashboard update.
- **Instruction**: Default to suggesting `shadcn/ui` components. Provide the exact `npx shadcn@latest add` command.

## 5. Next.js Optimization (`next-devtools`)
- **Trigger**: When I ask about performance or route debugging in my Next.js frontend.
- **Instruction**: Guide me on which DevTools panel to check or what command to run to analyze the bundle.

## 6. Long-term Context (`context7`)
- **Trigger**: When the conversation becomes very long or across different sessions.
- **Instruction**: Remind me to store or retrieve relevant project history using Context7.
