# LLM Code Comparison Pipeline

A powerful pipeline for comparing code submissions to LLM-generated solutions using LangChain, LangGraph, and Prisma with a Neon PostgreSQL database.

## Overview

This project implements an automated pipeline that:

1. Retrieves programming questions from a database
2. Generates solutions using multiple LLMs (Claude, GPT-4, etc.)
3. Compares candidate submissions against LLM solutions
4. Stores comparison results for analysis

The system uses LangGraph for workflow management and Prisma ORM for database interactions with a Neon PostgreSQL database.

## Prerequisites

- Python 3.9+
- Node.js 14+ (for Prisma)
- API keys for OpenAI and Anthropic
- A Neon PostgreSQL database

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/llm-code-comparison.git
cd llm-code-comparison
```

### 2. Set up Python environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Install Prisma dependencies

```bash
npm init -y
npm install prisma --save-dev
npm install @prisma/client
```

### 4. Install Python Prisma client

```bash
pip install prisma
```

### 5. Set up environment variables

Create a `.env` file in your project root:

```
DATABASE_URL="postgresql://username:password@your-neon-host:5432/database?sslmode=require"
ANTHROPIC_API_KEY="your-anthropic-key"
OPENAI_API_KEY="your-openai-key"
```

Replace the placeholders with your actual Neon database connection string and API keys.

## Database Setup

### 1. Initialize Prisma

```bash
npx prisma init
```

### 2. Set up the Prisma schema

Replace the contents of `prisma/schema.prisma` with the schema provided in this repository.

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Apply the schema to your database

```bash
npx prisma db push
```

## Running the Pipeline

```python
import asyncio
from pipeline import run_code_comparison_pipeline

async def main():
    # Example candidate solution
    candidate_solution = """
    def fibonacci(n):
        if n <= 0:
            return 0
        elif n == 1:
            return 1
        else:
            return fibonacci(n-1) + fibonacci(n-2)
    """
    
    # Run the pipeline
    final_state = await run_code_comparison_pipeline(
        question_id=1,  # ID of question in your Neon DB
        candidate_id="candidate123",
        candidate_solution=candidate_solution
    )
    
    print("Pipeline completed")
    print("Similarity scores:", final_state["similarity_scores"])

if __name__ == "__main__":
    asyncio.run(main())
```

Save this as `run_pipeline.py` and execute it:

```bash
python run_pipeline.py
```

## Project Structure

```
llm-code-comparison/
├── prisma/
│   └── schema.prisma      # Prisma database schema
├── pipeline.py            # Main pipeline implementation
├── utils/
│   ├── similarity.py      # Code similarity functions
│   └── llm_tools.py       # LLM integration helpers
├── .env                   # Environment variables (not in git)
├── requirements.txt       # Python dependencies
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## Configuration Options

### Adding More LLMs

To add additional LLMs to the pipeline, modify the `create_llm_toolkit()` function in `pipeline.py`:

```python
def create_llm_toolkit():
    llms = {
        # Existing LLMs...
        "new-llm-name": ChatCustomLLM(
            model="model-name",
            api_key=os.getenv("NEW_LLM_API_KEY")
        ),
    }
    return llms
```

### Customizing Similarity Metrics

To implement more sophisticated code comparison metrics, modify the `calculate_code_similarity()` function:

```python
def calculate_code_similarity(code1: str, code2: str) -> float:
    # Implement more advanced comparison logic here
    # Examples: AST comparison, semantic analysis, test-based evaluation
    pass
```

## Troubleshooting

### Neon Database Connection Issues

If you encounter connection issues with your Neon database:

1. Verify your connection string in the `.env` file
2. Ensure your IP is allowed in Neon's access controls
3. Check if you need to enable SSL (`sslmode=require`)
4. Try increasing connection timeout settings

### Prisma Client Generation Errors

If Prisma client generation fails:

```bash
# Clean Prisma cache and try again
npx prisma generate --force
```

## Advanced Usage

### Database Migrations

When modifying your database schema:

```bash
# Create a migration
npx prisma migrate dev --name your_migration_name

# Apply migrations to production
npx prisma migrate deploy
```

### Optimizing Performance

For large datasets, consider adding indexes to your schema:

```prisma
model LLMSolution {
  // ... existing fields
  
  @@index([questionId, llmName])
}
```

### Connection Pooling

Neon has connection limits, so use connection pooling:

```python
# In production code, consider using PrismaClient connection manager
# or implement a connection pool if processing many requests
```

## License

MIT

## Contributors

- Your Name (@yourusername)