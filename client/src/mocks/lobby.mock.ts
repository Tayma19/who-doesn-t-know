import type { Session } from "../types";
import { mockDelay, mockError } from "../api/http";
import {
  getSelectedStateName,
  setSelectedStateName,
  stateFixtures,
} from "./state.mock";

export interface MockJoinResult {
  gameId: number;
  roomCode: string;
  playerId: string;
  playerRef: number;
}

export function createGame(displayName: string): Promise<MockJoinResult> {
  if (!displayName.trim()) return mockError("Display name is required");
  // Start every new mock game from the small lobby fixture.
  setSelectedStateName("lobby2Players");
  return mockDelay({
    gameId: 1,
    roomCode: "K7MD2",
    playerId: "p_mock1",
    playerRef: 1,
  });
}

export function joinGame(
  roomCode: string,
  displayName: string,
): Promise<MockJoinResult> {
  const code = roomCode.trim().toUpperCase();
  const name = displayName.trim();

  if (!name) return mockError("Display name is required");
  if (code === "XXXXX" || code.length !== 5) return mockError("Game not found");
  if (name.toLowerCase() === "taken") {
    return mockError("Display name already used");
  }
  return mockDelay({
    gameId: 1,
    roomCode: code,
    playerId: "p_mock2",
    playerRef: 2,
  });
}

export function startGame(session: Session): Promise<{ ok: true }> {
  void session;
  const playerCount = stateFixtures[getSelectedStateName()].players.length;
  const needed = 4 - playerCount;
  if (needed > 0) {
    return mockError(
      `${needed} more player${needed === 1 ? "" : "s"} needed`,
    );
  }
  // Move the mock game forward so the whole flow can be previewed.
  setSelectedStateName("questioningState");
  return mockDelay({ ok: true });
}