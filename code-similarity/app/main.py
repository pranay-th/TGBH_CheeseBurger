from typing import List, Dict, Any, Annotated, TypedDict
import os
import json
from datetime import datetime
import operator
import logging

# LangChain and LangGraph imports
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

import langgraph.graph as lg
from langgraph.graph import END, StateGraph

# Prisma integration
from prisma import Prisma

# Environment variables
import dotenv
dotenv.load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('code_comparison.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# --------------------- MODEL DEFINITIONS --------------------- #

class QuestionType(TypedDict):
    id: int
    text: str
    language: str
    constraints: str


class LLMSolutionType(TypedDict):
    question_id: int
    llm_name: str
    solution: str
    timestamp: str


class ComparisonResultType(TypedDict):
    question_id: int
    candidate_id: str
    candidate_solution: str
    similarity_scores: Dict[str, float]
    timestamp: str


class PipelineState(TypedDict):
    question: QuestionType
    llm_solutions: Annotated[Dict[str, str], operator.or_]  # Merge dictionaries
    candidate_solution: str
    candidate_id: str
    similarity_scores: Dict[str, float]
    status: str
    error: Annotated[str, operator.add]  # Concatenate error messages


# --------------------- PRISMA DATABASE TOOLS --------------------- #

# Create a Prisma client as a global singleton
prisma_client = Prisma()

async def connect_to_database() -> str:
    """Connect to the Neon PostgreSQL database via Prisma."""
    logger.info("Attempting to connect to database...")
    await prisma_client.connect()
    logger.info("Successfully connected to database")
    return "Connected to Neon PostgreSQL database"

async def disconnect_from_database() -> str:
    """Disconnect from the Neon PostgreSQL database."""
    logger.info("Disconnecting from database...")
    await prisma_client.disconnect()
    logger.info("Successfully disconnected from database")
    return "Disconnected from Neon PostgreSQL database"

async def get_question_from_db(question_id: int) -> QuestionType:
    """Retrieve a specific programming question from the database."""
    question = await prisma_client.question.find_unique(
        where={
            "id": question_id
        }
    )
    
    if not question:
        raise ValueError(f"Question with ID {question_id} not found")
    
    return {
        "id": question.id,
        "text": question.text,
        "language": question.language,
        "constraints": question.constraints or ""
    }

async def store_llm_solution(solution: LLMSolutionType) -> str:
    """Store an LLM-generated solution in the database."""
    await prisma_client.llmsolution.create(
        data={
            "questionId": solution["question_id"],
            "llmName": solution["llm_name"],
            "solution": solution["solution"],
            "timestamp": datetime.now(),
            "metrics": json.dumps({}),  # Convert empty dict to JSON string for Prisma
            "question": {
                "connect": {
                    "id": solution["question_id"]
                }
            }
        }
    )
    
    return f"Solution for {solution['llm_name']} stored successfully"

async def store_comparison_result(result: ComparisonResultType) -> str:
    """Store a comparison result in the database."""
    await prisma_client.comparison.create(
        data={
            "questionId": result["question_id"],
            "candidateId": result["candidate_id"],
            "candidateSolution": result["candidate_solution"],
            "similarityScores": json.dumps(result["similarity_scores"]),  # Convert dict to JSON string
            "timestamp": datetime.now(),
            "question": {
                "connect": {
                    "id": result["question_id"]
                }
            }
        }
    )
    
    return f"Comparison result for candidate {result['candidate_id']} stored successfully"


# --------------------- LLM CODE GENERATION --------------------- #

def create_llm_toolkit():
    """Create LLM instances for code generation."""
    llms = {
        "gpt-4-turbo": ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.2,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        ),
        "gpt-3.5-turbo": ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.3,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
    }
    return llms


# Define the system prompt for code generation
code_gen_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a skilled programmer taking a coding test. Please solve the following programming problem. Write only the code as your answer, without explanations or additional text."),
    ("human", """
    Problem:
    {question_text}
    
    {constraints}
    
    Language: {language}
    """)
])


async def generate_solution(llm, state, llm_name):
    """Generate code solution using the specified LLM."""
    logger.info(f"Generating solution using {llm_name}...")
    question = state["question"]
    
    try:
        chain = code_gen_prompt | llm
        logger.debug(f"Invoking {llm_name} with question: {question['text'][:100]}...")
        response = chain.invoke({
            "question_text": question["text"],
            "constraints": question.get("constraints", ""),
            "language": question.get("language", "Python")
        })
        
        solution = response.content
        logger.info(f"Successfully generated solution with {llm_name}")
        logger.debug(f"Solution length: {len(solution)} characters")
        
        # Store in database
        logger.debug(f"Storing {llm_name} solution in database...")
        await store_llm_solution({
            "question_id": question["id"],
            "llm_name": llm_name,
            "solution": solution,
            "timestamp": datetime.now().isoformat()
        })
        
        # Return only the new solution
        return {
            "llm_solutions": {llm_name: solution},
            "error": ""  # Return empty error string to maintain state
        }
    except Exception as e:
        error_msg = f"Error generating solution with {llm_name}: {str(e)}\n"
        logger.error(error_msg, exc_info=True)
        return {
            "error": error_msg,
            "llm_solutions": {llm_name: ""}  # Return empty solution on error
        }


# --------------------- CODE COMPARISON --------------------- #

def calculate_code_similarity(code1: str, code2: str) -> float:

    # Simple character-based Jaccard similarity
        """
        Calculate similarity between two code snippets using an LLM.
        """
        llm = ChatOpenAI(
            model="gpt-4-turbo",
            temperature=0.2,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )

        prompt = f"""
        You are a code similarity evaluator. Given two code snippets, evaluate their similarity on a scale of 0 to 10, considering logic, structure, and standard coding practices.

        Code Snippet 1:
        {code1}

        Code Snippet 2:
        {code2}

        Provide a similarity score between 0 and 10:
        """

        response = llm(prompt)
        score = float(response.content.strip())
        return score


async def compare_solutions(state):
    """Compare candidate solution with all LLM solutions."""
    logger.info("Starting solution comparison...")
    similarity_scores = {}
    
    candidate_solution = state["candidate_solution"]
    logger.debug(f"Comparing against candidate solution (length: {len(candidate_solution)})")
    
    for llm_name, llm_solution in state["llm_solutions"].items():
        logger.debug(f"Calculating similarity score for {llm_name}...")
        similarity_scores[llm_name] = calculate_code_similarity(
            candidate_solution, 
            llm_solution
        )
        logger.info(f"Similarity score for {llm_name}: {similarity_scores[llm_name]:.4f}")
    
    state["similarity_scores"] = similarity_scores
    
    # Store comparison results
    logger.debug("Storing comparison results in database...")
    await store_comparison_result({
        "question_id": state["question"]["id"],
        "candidate_id": state["candidate_id"],
        "candidate_solution": state["candidate_solution"],
        "similarity_scores": similarity_scores,
        "timestamp": datetime.now().isoformat()
    })
    
    logger.info("Comparison completed successfully")
    return state


# --------------------- LANGGRAPH WORKFLOW --------------------- #

async def initialize_state(question_id, candidate_id, candidate_solution):
    """Initialize the state for the pipeline."""
    # Connect to the database
    await connect_to_database()
    
    # Get the question
    question = await get_question_from_db(question_id)
    
    return {
        "question": question,
        "llm_solutions": {},
        "candidate_solution": candidate_solution,
        "candidate_id": candidate_id,
        "similarity_scores": {},
        "status": "initialized",
        "error": ""
    }


def build_code_comparison_graph():
    """Build the LangGraph workflow for code comparison."""
    logger.info("Building code comparison graph...")
    
    llm_toolkit = create_llm_toolkit()
    logger.debug(f"Created LLM toolkit with models: {list(llm_toolkit.keys())}")
    
    workflow = StateGraph(PipelineState)
    
    # Add nodes with logging wrappers
    workflow.add_node("start", lambda x: x)
    logger.debug("Added start node")
    
    for llm_name, llm in llm_toolkit.items():
        async def generate_wrapper(state, llm=llm, name=llm_name):
            logger.info(f"Executing generate node for {name}...")
            result = await generate_solution(llm, state, name)
            logger.info(f"Completed generate node for {name}")
            return result
        
        workflow.add_node(f"generate_{llm_name}", generate_wrapper)
        logger.debug(f"Added generate node for {llm_name}")
    
    async def compare_wrapper(state):
        logger.info("Executing comparison node...")
        if len(state["llm_solutions"]) == len(create_llm_toolkit()):
            logger.info("All solutions ready, proceeding with comparison")
            return await compare_solutions(state)
        logger.info("Waiting for more solutions before comparison")
        return state
    
    workflow.add_node("compare_solutions", compare_wrapper)
    logger.debug("Added comparison node")
    
    async def disconnect_wrapper(state):
        logger.info("Executing disconnect node...")
        await disconnect_from_database()
        logger.info("Completed disconnect node")
        return state
    
    workflow.add_node("disconnect", disconnect_wrapper)
    logger.debug("Added disconnect node")
    
    # Add edges with logging
    for llm_name in llm_toolkit.keys():
        workflow.add_edge("start", f"generate_{llm_name}")
        workflow.add_edge(f"generate_{llm_name}", "compare_solutions")
        logger.debug(f"Added edges for {llm_name}")
    
    workflow.add_edge("compare_solutions", "disconnect")
    workflow.add_edge("disconnect", END)
    workflow.set_entry_point("start")
    
    logger.info("Graph building completed")
    return workflow.compile()


# --------------------- MAIN EXECUTION --------------------- #

async def run_code_comparison_pipeline(
    question_id: int, 
    candidate_id: str, 
    candidate_solution: str
):
    """
    Run the complete code comparison pipeline.
    
    Args:
        question_id: ID of the programming question
        candidate_id: ID of the candidate
        candidate_solution: The candidate's code solution
    
    Returns:
        Final state with comparison results
    """
    logger.info(f"Starting pipeline for question {question_id}, candidate {candidate_id}")
    
    graph = build_code_comparison_graph()
    logger.info("Graph compiled successfully")
    
    logger.info("Initializing pipeline state...")
    initial_state = await initialize_state(
        question_id=question_id,
        candidate_id=candidate_id,
        candidate_solution=candidate_solution
    )
    
    logger.info("Executing graph...")
    result = await graph.ainvoke(initial_state)
    logger.info("Pipeline execution completed")
    
    return result


# Example usage
if __name__ == "__main__":
    import asyncio
    
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
            question_id=1,
            candidate_id="candidate123",
            candidate_solution=candidate_solution
        )
        
        print("Pipeline completed")
        print("Similarity scores:", final_state["similarity_scores"])
    
    asyncio.run(main())