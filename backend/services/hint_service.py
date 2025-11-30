# backend/services/hint_service.py
import google.generativeai as genai
from typing import Optional
from config import Config
from utils.errors import APIError

class HintService:
    def __init__(self):
        if not Config.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY not configured")
        
        # Configure the Google AI
        genai.configure(api_key=Config.GOOGLE_API_KEY)
        
        # Initialize the model
        self.model = genai.GenerativeModel(
            model_name='gemini-2.0-flash',
            generation_config={
                'temperature': 0.7,
                'top_p': 0.8,
                'top_k': 40,
                'max_output_tokens': 150,
            }
        )
        
        self.system_instruction = """You are a helpful coding mentor for a competitive programming platform.
Your role is to provide hints that guide users toward the solution WITHOUT giving away the complete answer.

STRICT RULES:
1. Maximum 3 sentences per hint
2. NEVER provide complete working code
3. Focus on conceptual guidance, algorithm suggestions, or debugging clues
4. If you see errors, point out the type of error without fixing it directly
5. If code is incomplete, suggest what's missing conceptually
6. Use analogies or examples when helpful
7. Be encouraging and educational

Remember: Guide, don't solve."""

    def generate_hint(
        self,
        problem_title: str,
        problem_description: str,
        user_code: str,
        execution_output: Optional[str] = None,
        error_messages: Optional[str] = None
    ) -> str:
        """Generate a contextual hint based on problem and user's current state"""
        
        # Build context
        context_parts = [
            f"Problem: {problem_title}",
            f"Description: {problem_description[:500]}...",  # Truncate long descriptions
            f"\nUser's Current Code:\n```python\n{user_code[:800]}\n```"  # Limit code length
        ]
        
        if error_messages:
            context_parts.append(f"\nErrors Encountered:\n{error_messages[:300]}")
        elif execution_output:
            context_parts.append(f"\nExecution Output:\n{execution_output[:300]}")
        
        context = "\n".join(context_parts)
        
        # Create the full prompt
        full_prompt = f"""{self.system_instruction}

{context}

Based on the above, provide a helpful hint to guide the user. Remember:
- Maximum 3 sentences
- Don't give the full solution
- Focus on the next logical step or concept they should consider
- Be encouraging and educational

Hint:"""

        try:
            # Generate response
            response = self.model.generate_content(full_prompt)
            
            if not response or not response.text:
                raise APIError("Failed to generate hint", 500)
            
            hint = response.text.strip()
            
            # Validate hint length (safety check)
            sentences = [s.strip() for s in hint.split('.') if s.strip()]
            if len(sentences) > 4:  # Allow slight overflow
                hint = '. '.join(sentences[:3]) + '.'
            
            return hint
            
        except Exception as e:
            print(f"Hint generation error: {str(e)}")
            raise APIError(f"Failed to generate hint: {str(e)}", 500)

# Singleton instance
hint_service = HintService()