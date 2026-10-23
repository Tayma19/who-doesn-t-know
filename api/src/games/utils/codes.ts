import { randomBytes } from 'node:crypto';

const ROOM_CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateRoomCode(): string {
  const bytes = randomBytes(5);

  return Array.from(
    bytes,
    (byte) => ROOM_CODE_ALPHABET[byte % ROOM_CODE_ALPHABET.length],
  ).join('');
}

export function generatePlayerId(): string {
  return `p_${randomBytes(6).toString('hex')}`;
}
