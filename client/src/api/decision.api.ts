import { request, USE_MOCKS } from "./http";
import * as mock from "../mocks/decision.mock";

type DecisionSession = {
  roomCode: string;
  playerId: string;
};


export async function submitDecision(
  s: DecisionSession,
  choice: "continue" | "vote"
) {
  if (USE_MOCKS) {
    return mock.submitDecision(`${s.roomCode}:${s.playerId}`, choice);
  }

  return request<{ ok: true }>("POST", `/games/${s.roomCode}/decisions`, {
    playerId: s.playerId,
    choice,
  });
}