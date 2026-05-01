import os
import anthropic

SYSTEM_PROMPT = """You are HuntBot, an AI assistant that helps people design creative GPS-based treasure hunts and scavenger hunts.

Your job:
- Help creators design hunts with engaging checkpoints, clues, and stories
- Suggest real-world locations and landmarks that fit the hunt theme
- Write clues that are challenging but fair — give enough context to find the spot without making it trivial
- Keep the narrative consistent with the chosen theme (pirate, detective, fantasy, Halloween, etc.)
- When suggesting checkpoints, always include a lat/lng if the user mentions a specific city or landmark
- Be conversational and enthusiastic — hunt design should be fun

When a user asks you to generate a full hunt, respond with:
1. A brief narrative intro
2. A numbered list of checkpoints, each with:
   - Location name and description
   - The clue players will read (written IN the theme's voice)
   - A subtle hint if they get stuck
3. A story that ties all the checkpoints together

Keep responses concise and actionable. The user can always ask for more detail on any checkpoint."""


class LLMService:
    """
    Provider-agnostic LLM wrapper.
    Currently supports: anthropic
    Future: openai, google, xai — add a new branch in `complete()`
    """

    SUPPORTED_PROVIDERS = ['anthropic']

    def __init__(self, provider='anthropic', api_key=None):
        self.provider = provider
        self.api_key = api_key or os.getenv('ANTHROPIC_API_KEY')

    def complete(self, messages: list[dict], max_tokens: int = 1024) -> str:
        """
        Send a conversation and return the assistant's reply as a string.
        messages: [{"role": "user"|"assistant", "content": "..."}]
        """
        if self.provider == 'anthropic':
            return self._anthropic(messages, max_tokens)
        raise ValueError(f"Unsupported provider: {self.provider}. Supported: {self.SUPPORTED_PROVIDERS}")

    def _anthropic(self, messages: list[dict], max_tokens: int) -> str:
        client = anthropic.Anthropic(api_key=self.api_key)
        response = client.messages.create(
            model='claude-sonnet-4-6',
            max_tokens=max_tokens,
            system=SYSTEM_PROMPT,
            messages=messages,
        )
        return response.content[0].text
