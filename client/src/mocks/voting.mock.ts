
import type { Session } from "../types";
import { mockDelay, mockError } from "../api/http";

export type MockVoteResult = {
  ok: true;
};

const MOCK_PLAYER_REFS = [1, 2, 3, 4, 5];


const submittedVotes = new Set<string>();

type DecisionChoice = "continue" | "vote";

export async function submitRoundDecision(
  session: Session,
  choice: DecisionChoice,
): Promise<MockVoteResult> {
  if (!session.playerId.trim()) {
    return mockError("Player session is missing");
  }

  if (!["continue", "vote"].includes(choice)) {
    return mockError("Invalid round decision");
  }

  return mockDelay({ ok: true });
}

export async function castVote(
  session: Session,
  targetRef: number,
): Promise<MockVoteResult> {
  if (!session.playerId.trim()) {
    return mockError("Player session is missing");
  }

  if (!MOCK_PLAYER_REFS.includes(targetRef)) {
    return mockError("Selected player does not exist");
  }

  if (targetRef === session.playerRef) {
    return mockError("You cannot vote for yourself");
  }

  const voteKey = `${session.roomCode}:${session.playerId}`;

  if (submittedVotes.has(voteKey)) {
    return mockError("You have already voted");
  }

  
  submittedVotes.add(voteKey);

  return mockDelay({ ok: true });
}

export function resetVotingMock() {
  submittedVotes.clear();
}
