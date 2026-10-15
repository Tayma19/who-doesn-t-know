import { request, USE_MOCKS } from "./http";
import * as mock from "../mocks/decision.mock";
import type { Session } from "../types";

/**
 * Submits a player's decision ('continue' or 'vote') for the current round.
 * Uses mock data if VITE_USE_MOCKS=true, otherwise sends a POST request to the backend.
 */
export async function submitDecision(s: Session, choice: "continue" | "vote") {
  if (USE_MOCKS) {
    return mock.submitDecision(choice);
  }

  return request<{ ok: true }>("POST", `/games/${s.roomCode}/decisions`, {
    playerId: s.playerId,
    choice,
  });
}
