
import { request, USE_MOCKS } from "../api/http";
import * as mock from "../mocks/game.mock";
import type { Session } from "../types";

export function askQuestion(
  session: Session,
  targetRef: number,
  text: string,
): Promise<{ ok: true }> {
  if (USE_MOCKS) {
    return mock.askQuestion(session.playerRef, targetRef, text);
  }

  return request<{ ok: true }>(
    "POST",
    `/games/${session.roomCode}/questions`,
    {
      playerId: session.playerId,
      targetRef,
      text,
    },
  );
}

export function answerQuestion(
  session: Session,
  questionId: number,
  answer: string,
): Promise<{ ok: true }> {
  if (USE_MOCKS) {
    return mock.answerQuestion(answer);
  }

  return request<{ ok: true }>(
    "POST",
    `/games/${session.roomCode}/questions/${questionId}/answer`,
    {
      playerId: session.playerId,
      answer,
    },
  );
}
