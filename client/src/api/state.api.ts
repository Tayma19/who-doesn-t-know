import { request, USE_MOCKS } from "./http";
import * as mock from "../mocks/state.mock";
import type { PrivateRoleView, PublicGameState, Session } from "../types";

/** Public state: the same for everyone in the room. */
export function getState(roomCode: string): Promise<PublicGameState> {
  if (USE_MOCKS) return mock.getState(roomCode);
  return request<PublicGameState>("GET", `/games/${roomCode}/state`);
}

/** Private role view: only for the player whose id is sent. */
export function getMe(session: Session): Promise<PrivateRoleView> {
  if (USE_MOCKS) return mock.getMe(session);
  return request<PrivateRoleView>(
    "GET",
    `/games/${session.roomCode}/me?playerId=${encodeURIComponent(session.playerId)}`,
  );
}
