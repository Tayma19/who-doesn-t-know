import { request, USE_MOCKS } from "./http";
//import * as mock from "../mocks/game.mock";
import type { Session } from "../types";

export function askQuestion(
  session: Session,
  targetRef: number,
  text: string,
): Promise<{ ok: true }> {
  if (USE_MOCKS) {
    //return mock.askQuestion(targetRef, text);
  }

  return request("POST", `/games/${session.roomCode}/questions`, {
    playerId: session.playerId,
    targetRef,
    text,
  });
}

export function answerQuestion(
  session: Session,
  questionId: number,
  text: string,
): Promise<{ ok: true }> {
  if (USE_MOCKS) {
    //return mock.answerQuestion(questionId, text);
  }

  return request(
    "POST",
    `/games/${session.roomCode}/questions/${questionId}/answer`,
    {
      playerId: session.playerId,
      text,
    },
  );
}
