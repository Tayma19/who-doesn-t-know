
import { request, USE_MOCKS } from "../api/http";
import * as mock from "../mocks/voting.mock";
import type { Session } from "../types";

export function submitVote(
  session: Session,
  suspectRef: number,
): Promise<{ ok: true }> {
  if (USE_MOCKS) {
    return mock.castVote(session, suspectRef);
  }

  return request<{ ok: true }>(
    "POST",
    `/games/${session.roomCode}/votes`,
    {
      playerId: session.playerId,
      suspectRef,
    },
  );
}
