import type { Session } from "../types";

const keyFor = (roomCode: string) => `wdk_session_${roomCode.toUpperCase()}`;
const LAST_ROOM_KEY = "wdk_last_room";

/** Remember who this browser tab is (survives refresh, separate per tab). */
export function saveSession(s: Session): void {
  const room = s.roomCode.toUpperCase();
  try {
    sessionStorage.setItem(keyFor(room), JSON.stringify({ ...s, roomCode: room }));
    sessionStorage.setItem(LAST_ROOM_KEY, room);
  } catch {
    // storage unavailable: the player will have to join again after a refresh
  }
}

export function loadSession(roomCode: string): Session | null {
  try {
    const raw = sessionStorage.getItem(keyFor(roomCode));
    if (!raw) return null;
    const s = JSON.parse(raw) as Partial<Session>;
    if (
      typeof s.roomCode === "string" &&
      typeof s.playerId === "string" &&
      typeof s.playerRef === "number"
    ) {
      return s as Session;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    const last = sessionStorage.getItem(LAST_ROOM_KEY);
    if (last) sessionStorage.removeItem(keyFor(last));
    sessionStorage.removeItem(LAST_ROOM_KEY);
  } catch {
    // ignore
  }
}