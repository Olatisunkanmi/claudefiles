# How to Trigger Agents via Natural Language

Claude Code has specialized agents that automatically activate based on your natural language requests. You don't need special syntax—just describe what you want to accomplish.

## Available Agents

### Browser QA Agent 
**Purpose**: Live browser testing via Playwright - finds UI bugs, console errors, and UX issues

**Natural triggers:**
- "Test my web app for bugs"
- "Check my running application for UI issues" 
- "Run QA tests on localhost:3000"
- "Find console errors in my web app"
- "Check if my website works on mobile"
- "Test the user interface for problems"

**What it does:**
- Navigates your running web application
- Captures screenshots across devices
- Checks console for errors/warnings
- Tests responsive design
- Validates user flows
- Creates comprehensive audit reports

---

### Code Reviewer
**Purpose**: Expert code review for correctness, security, and Claude Code conventions

**Natural triggers:**
- "Review my code changes"
- "Check this code for issues"
- "Review my latest commit" 
- "Look over this function for problems"
- "Is this code ready for production?"
- "Check my pull request"

**What it does:**
- Analyzes code correctness and security
- Checks Claude Code skill file conventions
- Reviews bash safety and phase structure
- Identifies potential bugs or improvements
- Validates coding best practices

---

### Architect
**Purpose**: Generates architecture documentation and Mermaid diagrams

**Natural triggers:**
- "Show me the architecture of this codebase"
- "Create a diagram of the system structure"
- "Document the project architecture"
- "Generate an overview of how this works"
- "Map out the application structure"
- "Create architectural documentation"

**What it does:**
- Creates Mermaid diagrams
- Documents system architecture
- Maps component relationships
- Generates architectural overviews
- Helps with codebase onboarding

---

### Testing Reality Checker
**Purpose**: Adversarial pre-ship gate that defaults to "NEEDS WORK"

**Natural triggers:**
- "Is this code ready for production?"
- "Check if my app is deployment-ready"
- "Verify this is production-quality"
- "Can I ship this?"
- "Run final quality checks"
- "Is this ready to go live?"

**What it does:**
- Captures screenshots across devices
- Requires overwhelming evidence for approval
- Identifies production readiness issues
- Provides comprehensive quality assessment
- Acts as final validation gate

---

### General Purpose
**Purpose**: Research complex questions and execute multi-step tasks

**Natural triggers:**
- "Research how to implement feature X"
- "Find examples of Y in the codebase"
- "Search for and analyze Z"
- "Help me understand how this works"
- "Look up documentation for this framework"
- "Find similar implementations"

**What it does:**
- Searches codebases thoroughly
- Researches complex technical questions
- Executes multi-step analysis tasks
- Finds code examples and patterns
- Provides comprehensive research

---

### Engineering Technical Writer
**Purpose**: Creates developer documentation, API references, and tutorials

**Natural triggers:**
- "Write documentation for this API"
- "Create a README for this project"
- "Document how to use this function"
- "Write a tutorial for this feature"
- "Create API documentation"
- "Generate usage examples"

**What it does:**
- Writes clear, accurate technical documentation
- Creates API references and tutorials
- Transforms complex concepts into readable docs
- Generates README files and guides
- Produces developer-focused content

---

### Planner
**Purpose**: Lightweight planning specialist for feature planning

**Natural triggers:**
- "Plan how to implement this feature"
- "Break down this task into steps"
- "Create a plan for building X"
- "How should I approach this problem?"
- "Design an implementation strategy"
- "Plan the development phases"

**What it does:**
- Creates detailed implementation plans
- Breaks features into manageable tasks
- Identifies dependencies and requirements
- Suggests development approaches
- Provides structured planning guidance

## How It Works

1. **Intent Recognition**: Claude analyzes your request to understand what type of task you need
2. **Automatic Selection**: The appropriate agent is selected based on the task requirements
3. **Execution**: The agent runs with its specialized tools and knowledge
4. **Results**: You get the output from the specialist agent

## Tips for Better Results

### Be Specific About Context
- **Good**: "Test my React app running on localhost:3000"
- **Vague**: "Test my app"

### Mention Key Details
- **Good**: "Review my authentication code for security issues"
- **Vague**: "Review my code"

### Include Scope Information  
- **Good**: "Check if my e-commerce site is ready for production deployment"
- **Vague**: "Is this ready?"

### Use Action-Oriented Language
- **Good**: "Create architecture documentation for this microservice"
- **Vague**: "Tell me about the architecture"

## Manual Agent Triggering

If you need to explicitly trigger an agent (advanced use), you can use:

```
Task(
  subagent_type="agent-name",
  description="Brief description", 
  prompt="Detailed instructions"
)
```

But natural language is recommended for better user experience.

## Agent Combinations

Some complex tasks may trigger multiple agents in sequence:

1. **Research Phase**: General-purpose agent gathers information
2. **Implementation**: You write the code
3. **Review Phase**: Code reviewer validates the implementation  
4. **Quality Gate**: Testing reality checker verifies production readiness

This creates a comprehensive workflow from planning to deployment.

---

**Remember**: Just describe what you want to accomplish. Claude will automatically select and trigger the right specialist agent for your task.