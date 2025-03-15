import asyncio
from main import run_code_comparison_pipeline
async def test_pipeline():
    # Example usage
    final_state = await run_code_comparison_pipeline(
        question_id=1,  # ID of question in your Neon DB
        candidate_id="candidate123",
        candidate_solution="def solution(a, b): return a + b"
    )
    
    print("Similarity scores:", final_state["similarity_scores"])

# Run the pipeline
asyncio.run(test_pipeline())