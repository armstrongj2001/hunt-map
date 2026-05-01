import client from './client';

export async function sendChatMessage(messages) {
  const { data } = await client.post('/api/ai/chat/', { messages });
  return data.reply;
}
