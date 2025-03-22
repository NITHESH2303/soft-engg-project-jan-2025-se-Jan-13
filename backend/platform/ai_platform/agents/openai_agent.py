import json
import os
from typing import List, Dict, AsyncGenerator

from langchain_core.messages import SystemMessage
from openai import OpenAI
from ai_platform.agents.prompts import INST_HOST_AGENT, INST_PARSER_AGENT
from ai_platform.agents.streaming_services import OpenAIStreaming
from ai_platform.agents.tools_implemented import get_course_content
from ai_platform.supafast.database import get_db
from ai_platform.agents.tools import course_content_tool
from langchain_openai import ChatOpenAI


class Agents(OpenAIStreaming):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.system_prompt = SystemMessage(content=INST_HOST_AGENT)

    async def stream_response(
            self,
            user_input: str,
            course_id: int = None,
            chat_history: List[Dict[str, str]] = [],
            context: str = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream the agent's response to the frontend using LangChain and tool calling.
        """
        if context:
            host_prompt = self.system_prompt.content + "\nHere is the context...\n" + context
        else:
            host_prompt = self.system_prompt.content
        messages = [{"role": "system", "content": host_prompt}]
        for msg in chat_history:
            if msg.get("role") == "user":
                messages.append({"role": "user", "content": msg.get("content", "")})
            elif msg.get("role") == "assistant":
                messages.append({"role": "assistant", "content": msg.get("content", "")})
        # Append course_id to user input if provided
        if course_id:
            user_input += f" (Course ID: {course_id})"
        messages.append({"role": "user", "content": user_input})
        # Step 1: Synchronous call to handle tool calling
        completion = self.openai_client.chat.completions.create(
            messages=messages,
            model="gpt-4o-mini",
            tools=[course_content_tool]  # Use the same tool as call_openai_sync
        )
        response = completion.choices[0].message
        # Step 2: Process the response
        if response.tool_calls:
            # Append assistant message with tool calls
            messages.append({
                "role": "assistant",
                "content": response.content if response.content else None,
                "tool_calls": [tc.model_dump() for tc in response.tool_calls]
            })
            # Handle tool calls
            for tool_call in response.tool_calls:
                if tool_call.function.name == "get_course_content":
                    args = json.loads(tool_call.function.arguments)
                    print(f"Tool call detected: get_course_content with args {args}")
                    content = get_course_content(next(get_db()), **args)
                    print(f"Response from get_course_content: {content}")
                    messages.append({
                        "role": "tool",
                        "content": json.dumps(content),
                        "tool_call_id": tool_call.id
                    })
                    # Step 3: Stream the final response
                    stream = self.openai_client.chat.completions.create(
                        messages=messages,
                        model="gpt-4o-mini",
                        stream=True
                    )
                    for chunk in stream:
                        if chunk.choices[0].delta.content:
                            yield json.dumps({"type": "text", "content": chunk.choices[0].delta.content})
        else:
            # No tool calls, stream the response directly
            stream = self.openai_client.chat.completions.create(
                messages=messages,
                model="gpt-4o-mini",
                stream=True
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield json.dumps({"type": "text", "content": chunk.choices[0].delta.content})

        yield json.dumps({"type": "end"})

    def call_openai_sync(self, messages: List[Dict[str, str]], tools=None) -> str:
        # Prepend system prompt to messages

        # Initial call to OpenAI with tools
        completion = self.openai_client.chat.completions.create(
            messages=messages,
            model="gpt-4o-mini",
            tools=tools if tools else None
        )

        response = completion.choices[0].message

        # If no tool calls, return the response directly
        if not response.tool_calls:
            return response.content

        # Append the assistant message with tool_calls to the message history
        print(response)
        messages.append({
            "role": "assistant",
            "content": response.content if response.content else None,
            "tool_calls": [tc.model_dump() for tc in response.tool_calls]  # Convert tool_calls to dict
        })

        # Handle each tool call
        for tool_call in response.tool_calls:
            if tool_call.function.name == "get_course_content":
                args = json.loads(tool_call.function.arguments)
                print(f"Below are the args to pass the function get course content: {args}")
                content = get_course_content(
                    db=next(get_db()),
                    **args
                )
                print(f"Content received from get coure_content: {content}")
                # Append the tool response
                messages.append({
                    "role": "tool",
                    "content": json.dumps(content),
                    "tool_call_id": tool_call.id
                })

        # Second call to OpenAI with the updated message history
        final_completion = self.openai_client.chat.completions.create(
            messages=messages,
            model="gpt-4o-mini"
        )

        return final_completion.choices[0].message.content

    async def host_agent(self, user_query, context=None, history: List[Dict] = None, streaming=False):
        if context:
            host_prompt = INST_HOST_AGENT + "Here is the context, Please respond from this context from the first priority\n" + context
        else:
            host_prompt = INST_HOST_AGENT

        messages = [{"role": "system", "content": host_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_query})
        if streaming:
            return await super().streamNow(user_query, messages=messages)
        else:
            return self.call_openai_sync(messages, tools=[course_content_tool])  # Fixed non-streaming response

    async def parser_agent(self, user_query, history: List[Dict] = None, context: str = None, streaming=False):
        if context:
            system_prompt = INST_PARSER_AGENT + f"\n Below is the actual context for most recent user message: {context}\n"
        else:
            system_prompt = INST_PARSER_AGENT
        messages = [{"role": "system", "content": system_prompt}]
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
