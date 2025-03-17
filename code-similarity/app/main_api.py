from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # Add this import
from pydantic import BaseModel
from typing import Dict, Optional
from datetime import datetime
import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import logging
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Request models
class CodeComparisonRequest(BaseModel):
    question_text: str
    candidate_code: str
    language: str = "Python"
    constraints: Optional[str] = None

class CodeComparisonResponse(BaseModel):
    report_path: str
    similarity_score: float
    llm_solution: str


# LLM setup
llm = ChatOpenAI(
    model="gpt-4-turbo",
    temperature=0.2,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)

# Prompts
solution_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a skilled programmer. Write a solution for the given problem. Provide only the code, no explanations."),
    ("human", """
    Problem: {question_text}
    Language: {language}
    Constraints: {constraints}
    """)
])

comparison_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a code similarity evaluator. Analyze code snippets and provide a structured analysis.
    Always start your response with a clear score line in this exact format: 'Similarity Score: X/10' where X is a number from 0 to 10."""),
    ("human", """
    Compare these two code solutions and provide:
    1. A similarity score (0-10) in the format 'Similarity Score: X/10'
    2. A detailed analysis of similarities and differences
    3. Suggestions for improvement

    Solution 1 (Candidate):
    ```{language}
    {candidate_code}
    ```

    Solution 2 (Reference):
    ```{language}
    {reference_code}
    ```

    Start your response with the score line.
    """)
])

def generate_report(
    question: str,
    candidate_code: str,
    llm_solution: str,
    similarity_score: float,
    analysis: str,
    language: str
) -> str:
    """Generate a markdown report and save it to disk."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_dir = "reports"
    os.makedirs(report_dir, exist_ok=True)

    report_path = "./reports/comparison_report_{timestamp}.md"

    report_content = f"""# Code Comparison Report

## Problem Statement
{question}
## Candidate Solution ({language})
```{language}
{candidate_code}
```

## Reference Solution ({language})
```
{llm_solution}
```

## Analysis
{analysis}

## Generated on: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
"""

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_content)

    return report_path

@app.post("/compare-code", response_model=CodeComparisonResponse)
async def compare_code(request: CodeComparisonRequest):
    try:
        logger.info("Received code comparison request")

        # Generate reference solution using LLM
        logger.info("Generating reference solution")
        solution_chain = solution_prompt | llm
        solution_response = solution_chain.invoke({
            "question_text": request.question_text,
            "language": request.language,
            "constraints": request.constraints or "None"
        })
        llm_solution = solution_response.content

        # Compare solutions
        logger.info("Comparing solutions")
        comparison_chain = comparison_prompt | llm
        comparison_response = comparison_chain.invoke({
            "language": request.language,
            "candidate_code": request.candidate_code,
            "reference_code": llm_solution
        })

        # Extract score
        content = comparison_response.content
        logger.debug(f"Comparison response: {content}")

        # Try different patterns to extract the score
        similarity_score = 0
        try:
            if "**" in content:
                import re
                score_match = re.search(r'\*\*(\d+)/10\*\*', content)
                if score_match:
                    similarity_score = float(score_match.group(1))
            else:
                analysis_lines = content.split("\n")
                score_line = next(line for line in analysis_lines if "score" in line.lower())
                score_match = re.search(r'(\d+)(?:/10)?', score_line)
                if score_match:
                    similarity_score = float(score_match.group(1))
        except Exception as e:
            logger.warning(f"Error extracting score, using default scoring method: {str(e)}")
            similarity_score = 5

        # Generate and save report
        logger.info("Generating report")
        report_path = generate_report(
            question=request.question_text,
            candidate_code=request.candidate_code,
            llm_solution=llm_solution,
            similarity_score=similarity_score,
            analysis=comparison_response.content,
            language=request.language
        )

        logger.info(f"Report generated at: {report_path}")

        # Make sure to return all required fields
        return CodeComparisonResponse(
            report_path=report_path,
            similarity_score=similarity_score,
            llm_solution=llm_solution
        )

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, port=8004)