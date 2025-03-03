import json

from ai_platform.agents.prompts import INST_HOST_AGENT, INST_PARSER_AGENT
from ai_platform.agents.streaming_services import OpenAIStreaming
from openai import OpenAI
import os
import re
from typing import Union, List, Dict


class Agents(OpenAIStreaming):
    def __init__(self, *args, **kwargs):
        # Call the __init__ method of the parent class
        super().__init__(*args, **kwargs)
        self.openai_client = OpenAI(
            api_key=os.environ.get("OPENAI_API_KEY"),
        )

    def call_openai_sync(self, messages):
        completion = self.openai_client.chat.completions.create(
            messages=messages,
            model="gpt-4o-mini",
        )
        input_tokens = completion.usage.prompt_tokens
        output_tokens = completion.usage.completion_tokens
        total_tokens = completion.usage.total_tokens
        # Calculate the estimated cost
        cost_input = (input_tokens / 1000) * 0.03  # $0.03 per 1k input tokens
        cost_output = (output_tokens / 1000) * 0.06  # $0.06 per 1k output tokens
        total_cost = cost_input + cost_output
        return completion.choices[0].message.content

    async def host_agent(self, user_query, context=None, history: List[Dict] = None, streaming=False):
        if context:
            host_prompt = INST_HOST_AGENT + "Here is the context, Please respond from this context from the first priority\n" + context
        else:
            host_prompt = INST_HOST_AGENT
        if streaming:
            messages = [{"role": "system", "content": host_prompt}]
            if history:
                messages.extend(history)
            return await super().streamNow(user_query, messages=messages)
        else:
            pass  # implement non-streaming responses

    async def parser_agent(self, user_query, history: List[Dict] = None, streaming=False):
        messages = [
            {"role": "system", "content": INST_PARSER_AGENT},
        ]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": user_query})
        completion = self.openai_client.chat.completions.create(
            messages=messages,
            model="gpt-4o-mini",
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
