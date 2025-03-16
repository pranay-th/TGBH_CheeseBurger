from typing import List, Dict, Any, Annotated, TypedDict
import os
import json
from datetime import datetime
import operator

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
    error: str


# --------------------- PRISMA DATABASE TOOLS --------------------- #

# Create a Prisma client as a global singleton
prisma_client = Prisma()

async def connect_to_database() -> str:
    """Connect to the Neon PostgreSQL database via Prisma."""
    await prisma_client.connect()
    return "Connected to Neon PostgreSQL database"

async def disconnect_from_database() -> str:
    """Disconnect from the Neon PostgreSQL database."""
    await prisma_client.disconnect()
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
            "metrics": {}  # Default empty metrics
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
            "similarityScores": result["similarity_scores"],
            "timestamp": datetime.now()
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
    question = state["question"]
    
    try:
        chain = code_gen_prompt | llm
        response = chain.invoke({
            "question_text": question["text"],
            "constraints": question.get("constraints", ""),
            "language": question.get("language", "Python")
        })
        
        # Extract just the code
        solution = response.content
        
        # Store in database
        await store_llm_solution({
            "question_id": question["id"],
            "llm_name": llm_name,
            "solution": solution,
            "timestamp": datetime.now().isoformat()
        })
        
        # Return only the new solution in the expected format
        return {
            "llm_solutions": {llm_name: solution}
        }
    except Exception as e:
        return {
            "error": f"Error generating solution with {llm_name}: {str(e)}"
        }


# --------------------- CODE COMPARISON --------------------- #

def calculate_code_similarity(code1: str, code2: str) -> float:
    """
    Calculate similarity between two code snippets using a simple Jaccard similarity.
    """
    # Simple character-based Jaccard similarity
    set1 = set(code1.replace(" ", "").replace("\n", ""))
    set2 = set(code2.replace(" ", "").replace("\n", ""))
    
    intersection = len(set1.intersection(set2))
    union = len(set1.union(set2))
    
    if union == 0:
        return 0.0
    
    return intersection / union


async def compare_solutions(state):
    """Compare candidate solution with all LLM solutions."""
    similarity_scores = {}
    
    candidate_solution = state["candidate_solution"]
    
    for llm_name, llm_solution in state["llm_solutions"].items():
        similarity_scores[llm_name] = calculate_code_similarity(
            candidate_solution, 
            llm_solution
        )
    
    state["similarity_scores"] = similarity_scores
    
    # Store comparison results
    await store_comparison_result({
        "question_id": state["question"]["id"],
        "candidate_id": state["candidate_id"],
        "candidate_solution": state["candidate_solution"],
        "similarity_scores": similarity_scores,
        "timestamp": datetime.now().isoformat()
    })
    
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
    # Create the LLM toolkit
    llm_toolkit = create_llm_toolkit()
    
    # Define the graph
    workflow = StateGraph(PipelineState)
    
    # Add a start node
    workflow.add_node("start", lambda x: x)
    
    # Add generate solution nodes for each LLM
    for llm_name, llm in llm_toolkit.items():
        async def generate_wrapper(state, llm=llm, name=llm_name):
            return await generate_solution(llm, state, name)
        
        workflow.add_node(f"generate_{llm_name}", generate_wrapper)
    
    # Add comparison node
    async def compare_wrapper(state):
        if len(state["llm_solutions"]) == len(create_llm_toolkit()):
            return await compare_solutions(state)
        return state
    
    workflow.add_node("compare_solutions", compare_wrapper)
    
    # Add disconnect node
    async def disconnect_wrapper(state):
        await disconnect_from_database()
        return state
    
    workflow.add_node("disconnect", disconnect_wrapper)
    
    # Define the edges
    for llm_name in llm_toolkit.keys():
        workflow.add_edge("start", f"generate_{llm_name}")
        workflow.add_edge(f"generate_{llm_name}", "compare_solutions")
    
    workflow.add_edge("compare_solutions", "disconnect")
    workflow.add_edge("disconnect", END)
    
    workflow.set_entry_point("start")
    
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
    # Create the graph
    graph = build_code_comparison_graph()
    
    # Set up the checkpoint saver

    # saver = SqliteSaver.from_conn_string("sqlite:///pipeline_checkpoints.db")
    
    # Initialize the state
    initial_state = await initialize_state(
        question_id=question_id,
        candidate_id=candidate_id,
        candidate_solution=candidate_solution
    )
    
    # Run the graph with checkpointing
    result = await graph.ainvoke(
        initial_state
        # ,
        # {
        #     # "configurable": {
        #         "checkpoint": saver
        #     }
        # }
    )
    
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