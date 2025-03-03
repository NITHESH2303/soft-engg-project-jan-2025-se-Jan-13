import os
import time

from openai import AsyncOpenAI
import async_timeout
import asyncio
from fastapi import HTTPException
import openai
from openai.types.chat import ChatCompletionChunk
from openai._streaming import AsyncStream
from typing import AsyncGenerator
import tiktoken
from dotenv import load_dotenv
load_dotenv(override=True)

class OpenAIStreaming:
    def __init__(self, GENERATION_TIMEOUT_SEC=60):
        self.GENERATION_TIMEOUT_SEC = GENERATION_TIMEOUT_SEC
        self.asyncClient = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def stream_generator(self, subscription):  # TODO: change here
        async with async_timeout.timeout(self.GENERATION_TIMEOUT_SEC):
            try:
                async for chunk in subscription:
                    await asyncio.sleep(0.05)  # simulate slow processing
                    yield "data: " + (chunk.choices[0].delta.content or "") + "\n\n"
            except asyncio.TimeoutError:
                raise HTTPException(status_code=504, detail="Stream timed out")

    async def string_stream_generator(self, data: str, delayed: bool) -> AsyncGenerator[bytes, None]:
        if delayed:
            encoding = tiktoken.get_encoding("cl100k_base")
            token_data = encoding.encode(data)
            for token in token_data:
                chunk = "data: " + (encoding.decode([token])) + "\n\n"
                yield chunk
                await asyncio.sleep(0.1)  # simulate slow processing
        else:
            yield data.encode()

    async def streamNow(self, prompt, messages=None, history=()) -> AsyncStream[ChatCompletionChunk]:
        try:
            if not messages:
                messages = [{"role": "user", "content": prompt}]
            else:
                messages.append({"role": "user", "content": prompt})
            stream = await self.asyncClient.chat.completions.create(
                model="gpt-4o",
                messages=messages,  # TODO: implement history
                stream=True,
            )
            return stream
        except openai.OpenAIError as e:  # TODO: handle OPENAI error separately
            raise HTTPException(status_code=500, detail=f'OpenAI call failed: {e}')

    # separate due to use of gpt-4o-mini
    async def streamNowFAQ(self, prompt, messages=None, history=()) -> AsyncStream[ChatCompletionChunk]:
        try:
            if not messages:
                messages = [{"role": "user", "content": prompt}]
            else:
                messages.append({"role": "user", "content": prompt})
            stream = await self.asyncClient.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,  # TODO: implement history
                stream=True,
            )
            return stream
        except openai.OpenAIError as e:  # TODO: handle OPENAI error separately
            raise HTTPException(status_code=500, detail=f'OpenAI call failed: {e}')

    def stream_string(self, data: str, delayed: bool = True):
        return self.string_stream_generator(data, delayed)
