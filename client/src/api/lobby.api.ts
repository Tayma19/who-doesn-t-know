import { request, USE_MOCKS } from "./http";
import * as mock from "../mocks/lobby.mock";
import type { Session } from "../types";

export interface JoinResult {
  gameId: number;
  roomCode: string;
  playerId: string;
  playerRef: number;
}

export function createGame(displayName: string): Promise<JoinResult> {
  if (USE_MOCKS) return mock.createGame(displayName);
  return request<JoinResult>("POST", "/games", { displayName });
}

export function joinGame(
  roomCode: string,
  displayName: string,
): Promise<JoinResult> {
  if (USE_MOCKS) return mock.joinGame(roomCode, displayName);
  return request<JoinResult>("POST", "/games/join", { roomCode, displayName });
}

export function startGame(session: Session): Promise<unknown> {
  if (USE_MOCKS) return mock.startGame(session);
  return request<unknown>("POST", `/games/${session.roomCode}/start`, {
    playerId: session.playerId,
  });
}