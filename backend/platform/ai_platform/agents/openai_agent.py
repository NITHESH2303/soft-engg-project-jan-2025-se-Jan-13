import json
import os
from typing import List, Dict
from openai import OpenAI
from ai_platform.agents.prompts import INST_HOST_AGENT, INST_PARSER_AGENT
from ai_platform.agents.streaming_services import OpenAIStreaming


class Agents(OpenAIStreaming):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    def call_openai_sync(self, messages):
        completion = self.openai_client.chat.completions.create(
            messages=messages,
            model="gpt-4o-mini",
        )
        input_tokens = completion.usage.prompt_tokens
        output_tokens = completion.usage.completion_tokens
        total_tokens = completion.usage.total_tokens
        cost_input = (input_tokens / 1000) * 0.03  # $0.03 per 1k input tokens
        cost_output = (output_tokens / 1000) * 0.06  # $0.06 per 1k output tokens
        total_cost = cost_input + cost_output
        return completion.choices[0].message.content

    async def host_agent(self, user_query, context=None, history: List[Dict] = None, streaming=False):
        if context:
            host_prompt = INST_HOST_AGENT + "Here is the context, Please respond from this context from the first priority\n" + context
        else:
            host_prompt = INST_HOST_AGENT

        messages = [{"role": "system", "content": host_prompt}]
        if history:
            messages.extend(history)

        if streaming:
            return await super().streamNow(user_query, messages=messages)
        else:
            return self.call_openai_sync(messages)  # Fixed non-streaming response

    async def parser_agent(self, user_query, history: List[Dict] = None, streaming=False):
        messages = [{"role": "system", "content": INST_PARSER_AGENT}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_query})

        completion = self.openai_client.chat.completions.create(
            messages=messages,
            model="gpt-4o-mini",
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)

    def load_course_data(self, course_name):
        """Loads course data from the specified course_data directory."""
        
        # Define the correct absolute path
        base_path = os.path.join(
            os.getcwd(),  # Get current working directory
            "backend", "platform", "ai_platform", "embedding_data", "course_data"
        )
        
        # Create the full path for the course folder
        course_folder = os.path.join(base_path, course_name.replace(" ", "_").replace("-", "_"))
        
        data = {}
        for file_name in ["content.txt", "summary.txt", "faqs.txt"]:
            file_path = os.path.join(course_folder, file_name)
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    data[file_name] = f.read()
            else:
                data[file_name] = "File not found"

        return data

    async def conversation_agent(self, user_query, history: List[Dict] = None, streaming=False):
        """Fetches course data from files and generates responses."""
        course_name = None
        for course in ["Business Data Management", "Business Analytics", "Modern Application Development - 1"]:
            if course.lower() in user_query.lower():
                course_name = course
                break

        if not course_name:
            return {"error": "Course not found. Please provide a valid course name."}

        # Load course data from files
        course_data = self.load_course_data(course_name)  # Fixed the method call

        # Format response
        response_text = f"Course: {course_name}\n\n"
        response_text += f"{course_data['summary.txt']}\n\n"
        response_text += f"More Details:\n{course_data['content.txt']}\n\n"
        response_text += f"FAQs:\n{course_data['faqs.txt']}"

        if streaming:
            messages = [{"role": "system", "content": "Provide detailed course-related responses."}]
            if history:
                messages.extend(history)
            return await super().streamNow(response_text, messages=messages)
        else:
            return response_text  
