import client from './client';

export async function createHuntWithCheckpoints({ title, description, theme, game_mode, checkpoints }) {
  // 1. Create the hunt
  const { data: hunt } = await client.post('/api/hunts/', {
    title: title || 'Untitled Hunt',
    description: description || '',
    theme: theme || 'custom',
    game_mode: game_mode || 'freeplay',
    status: 'draft',
  });

  // 2. Create each checkpoint in order
  if (checkpoints?.length) {
    await Promise.all(
      checkpoints.map((cp, i) =>
        client.post(`/api/hunts/${hunt.id}/checkpoints/`, {
          order: i + 1,
          latitude: cp.latitude,
          longitude: cp.longitude,
          clue_text: cp.clue || cp.address || '',
          hint_text: cp.hint || '',
        })
      )
    );
  }

  return hunt;
}

export async function fetchMyHunts() {
  const { data } = await client.get('/api/hunts/?mine=true');
  return data;
}

export async function fetchHunt(id) {
  const { data } = await client.get(`/api/hunts/${id}/`);
  return data;
}

export async function fetchCheckpoints(huntId) {
  const { data } = await client.get(`/api/hunts/${huntId}/checkpoints/`);
  return data;
}

export async function updateHunt(id, fields) {
  const { data } = await client.patch(`/api/hunts/${id}/`, fields);
  return data;
}

export async function deleteHunt(id) {
  await client.delete(`/api/hunts/${id}/`);
}

export async function updateCheckpoint(huntId, cpId, fields) {
  const { data } = await client.patch(`/api/hunts/${huntId}/checkpoints/${cpId}/`, fields);
  return data;
}
