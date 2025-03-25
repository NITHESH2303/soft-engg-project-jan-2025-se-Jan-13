import json
import os
from typing import List, Dict, AsyncGenerator, Union
from openai import OpenAI
from ai_platform.agents.tools_implemented import get_course_content
from ai_platform.supafast.database import get_db
from ai_platform.agents.tools import course_content_tool
from ai_platform.supafast.models.ai_agent import AiAgent
from ai_platform.vectordb.db_pgvector import PgvectorDB


class Agents:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.db = next(get_db())
        self.agents = self._load_agents()

    def _load_agents(self) -> Dict[int, AiAgent]:
        """Load all agents from the database"""
        agents = {}
        db_agents = self.db.query(AiAgent).all()
        for agent in db_agents:
            agents[agent.id] = agent
        return agents

    def _get_agent_config(self, agent_id: int) -> AiAgent:
        """Get configuration for a specific agent"""
        return self.agents.get(agent_id)

    async def stream_response(
            self,
            user_input: str,
            agent_id: int,
            course_id: int = None,
            chat_history: List[Dict[str, str]] = [],
            context: str = None
    ) -> AsyncGenerator[str, None]:
        """Generic stream response method that uses agent-specific configuration"""
        agent = self._get_agent_config(agent_id)
        if not agent:
            yield json.dumps({"type": "error", "content": "Agent not found"})
            return

        system_prompt = agent.system_prompt or "You are a helpful assistant."
        if context:
            system_prompt += "\nHere is the context...\n" + context

        messages = [{"role": "system", "content": system_prompt}]
        for msg in chat_history:
            if msg.get("role") == "user":
                messages.append({"role": "user", "content": msg.get("content", "")})
            elif msg.get("role") == "assistant":
                messages.append({"role": "assistant", "content": msg.get("content", "")})

        if course_id:
            user_input += f" (Course ID: {course_id})"
        messages.append({"role": "user", "content": user_input})

        model_params = {
            "messages": messages,
            "model": agent.model_name,
            "tools": [course_content_tool],
            "temperature": agent.temperature,
            "max_tokens": agent.response_token_limit,
            "stream": True
        }

        completion = self.openai_client.chat.completions.create(**model_params)
        # For now handling single tool call
        tool_args = ""
        tool_name = ""
        tool_id = ""
        tool_call_object = None
        for chunk in completion:
            print(f"Yielding chunk in completion", chunk)

            # Handle content chunks
            if chunk.choices[0].delta.content:
                yield json.dumps({"type": "text", "content": chunk.choices[0].delta.content})

            # Handle tool calls - this is the problematic part
            if chunk.choices[0].delta.tool_calls:
                if chunk.choices[0].delta.tool_calls[0]:
                    if chunk.choices[0].delta.tool_calls[0].function.arguments:
                        tool_args += chunk.choices[0].delta.tool_calls[0].function.arguments
                        continue
                    else:
                        # If argument is empty then it must be first chunk so get tool id and name
                        tool_call_object = chunk.choices[0].delta.tool_calls
                        tool_name += chunk.choices[0].delta.tool_calls[0].function.name
                        tool_id += chunk.choices[0].delta.tool_calls[0].id

            if not chunk.choices[0].delta.tool_calls and chunk.choices[0].finish_reason == "tool_calls":
                #If finish reason is tool calls then break this and call the tool and start another streaming
                break

        # Now if the loop breaks using tool call, then call the tool and yield the final chunks
        # Handle tool calls
        if tool_name == "get_course_content":
            args = json.loads(tool_args)
            print(f"Tool call detected: get_course_content with args {args}")
            content = get_course_content(next(get_db()), **args)
            print(f"Response from get_course_content: {content}")
            messages.append({
                "role": "assistant",
                "content": None,
                "tool_calls": tool_call_object
            })
            messages.append({
                "role": "tool",
                "content": json.dumps(content),
                "tool_call_id": tool_id
            })
            # Step 3: Stream the final response
            stream = self.openai_client.chat.completions.create(
                messages=messages,
                model=agent.model_name,
                stream=True
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield json.dumps({"type": "text", "content": chunk.choices[0].delta.content})
        # Finally reset the tool metadata and yield end
        tool_id = ""
        tool_name = ""
        tool_args = ""
        tool_call_object = None
        yield json.dumps({"type": "end"})

    def _execute_agent_sync(
            self,
            agent_id: int,
            user_query: str,
            context: str = None,
            history: List[Dict] = None
    ) -> Union[Dict, str]:
        """Synchronous execution logic for non-streaming agents"""
        agent = self._get_agent_config(agent_id)
        if not agent:
            return {"error": "Agent not found"}

        system_prompt = agent.system_prompt or "You are a helpful assistant."
        if context:
            system_prompt += f"\nContext: {context}"

        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_query})

        is_json_response = agent.response_format == "json" or "parser" in agent.name.lower()

        model_params = {
            "messages": messages,
            "model": agent.model_name,
            "temperature": agent.temperature,
            "max_tokens": agent.response_token_limit,
            "tools": [course_content_tool] if not is_json_response else None
        }

        if is_json_response:
            model_params["response_format"] = {"type": "json_object"}

        completion = self.openai_client.chat.completions.create(**model_params)
        response = completion.choices[0].message

        if response.tool_calls and not is_json_response:
            # Create a new messages array with the original messages plus the assistant's response
            tool_messages = messages.copy()
            tool_messages.append({
                "role": "assistant",
                "content": response.content,
                "tool_calls": response.tool_calls
            })

            # Now add the tool response
            for tool_call in response.tool_calls:
                if tool_call.function.name == "get_course_content":
                    args = json.loads(tool_call.function.arguments)
                    content = get_course_content(next(get_db()), **args)
                    tool_messages.append({
                        "role": "tool",
                        "content": json.dumps(content),
                        "tool_call_id": tool_call.id
                    })

            # Make the final call with the tool responses included
            final_completion = self.openai_client.chat.completions.create(
                messages=tool_messages,
                model=agent.model_name,
                temperature=agent.temperature,
                max_tokens=agent.response_token_limit
            )
            return final_completion.choices[0].message.content
        elif is_json_response:
            return json.loads(response.content)
        return response.content

    async def agent_response(
            self,
            agent_id: int,
            user_query: str,
            history: List[Dict] = None,
            context: str = None,
            streaming: bool = False
    ) -> AsyncGenerator[Union[Dict, str], None]:
        """Public method to handle agent responses with dynamic behavior"""
        agent = self._get_agent_config(agent_id)
        if not agent:
            yield json.dumps({"type": "error", "content": "Agent not found"})
            return

        # If this is a host-like agent, use a parser-like agent first
        if "host" in agent.name.lower():
            parser_agent_id = next(
                (id for id, a in self.agents.items() if "parser" in a.name.lower()),
                None
            )
            if parser_agent_id:
                parser_response = self._execute_agent_sync(
                    agent_id=parser_agent_id,
                    user_query=user_query,
                    context=context,
                    history=history
                )
                if isinstance(parser_response, dict) and "vector_index" in parser_response:
                    vector_index = parser_response["vector_index"]
                    if vector_index != "general":
                        vectordb = PgvectorDB(
                            collection_name=vector_index,
                            connection_str=os.getenv("SQLALCHEMY_DATABASE_URL")
                        )
                        additional_context = vectordb.get_context_for_query(user_query, include_metadata=False)
                        context = (context or "") + f"\nVector DB Context: {additional_context}"

        if streaming:
            print(f"Streaming is true")
            # For tracking tool calls
            messages = []
            if history:
                for msg in history:
                    messages.append(msg)

            # Keep track of accumulated text content to send to frontend
            accumulated_text = ""

            async for chunk in self.stream_response(
                    user_input=user_query,
                    agent_id=agent_id,
                    chat_history=history,
                    context=context
            ):
                print(f"Processing chunk: {chunk}")
                chunk_data = json.loads(chunk)

                # If it's a text chunk, send it to the frontend directly
                if chunk_data["type"] == "text":
                    accumulated_text += chunk_data["content"]
                    yield json.dumps({"type": "text", "content": chunk_data["content"]})

                elif chunk_data["type"] == "end":
                    yield json.dumps({"type": "end"})
        else:
            result = self._execute_agent_sync(
                agent_id=agent_id,
                user_query=user_query,
                context=context,
                history=history
            )
            yield json.dumps({"type": "result", "content": result})

    def load_course_data(self, course_name):
        """Loads course data from the specified course_data directory."""
        base_path = os.path.join(
            os.getcwd(),
            "backend", "platform", "ai_platform", "embedding_data", "course_data"
        )
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
