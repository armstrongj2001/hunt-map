from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .services import LLMService


class ChatView(APIView):
    """
    POST /api/ai/chat/
    Body: { "messages": [{"role": "user", "content": "..."}, ...] }
    Returns: { "reply": "..." }

    Full conversation history is sent each request so the AI has context.
    The frontend owns history — backend is stateless.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        messages = request.data.get('messages')
        if not messages or not isinstance(messages, list):
            return Response({'error': 'messages array required'}, status=status.HTTP_400_BAD_REQUEST)

        for msg in messages:
            if msg.get('role') not in ('user', 'assistant') or not msg.get('content'):
                return Response({'error': 'Each message needs role (user|assistant) and content'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            llm = LLMService(provider='anthropic')
            reply = llm.complete(messages)
            return Response({'reply': reply})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
