import { request, USE_MOCKS } from "./http";
import * as mock from "../mocks/decision.mock";

type DecisionSession = {
  roomCode: string;
  playerId: string;
};

/**
 * Submits a player's decision ('continue' or 'vote') for the current round.
 * Uses mock data if USE_MOCKS is true, otherwise sends a POST request to the backend.
 */
export async function submitDecision(
  s: DecisionSession,
  choice: "continue" | "vote"
) {
  if (USE_MOCKS) {
    return mock.submitDecision(`${s.roomCode}:${s.playerId}`, choice);
  }

  return request<{ ok: true }>("POST", `/api/games/${s.roomCode}/decisions`, {
    playerId: s.playerId,
    choice,
  });
}