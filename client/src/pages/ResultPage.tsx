import type { ScreenProps } from "../types";

export default function ResultPage({ state }: ScreenProps) {
  const result = state.result;

  if (!result) {
    return (
      <main className="result-page">
        <h1>Results aren't available yet.</h1>
      </main>
    );
  }

  const hiddenPlayer = state.players.find(
    (player) => player.ref === result.hiddenPlayerRef
  );

  const playersWithVotes = state.players
    .map((player) => ({
      ...player,
      votes:
        result.voteCounts.find((vote) => vote.ref === player.ref)?.votes ?? 0,
    }))
    .sort((a, b) => b.votes - a.votes);

  return (
    <main className="result-page">
      <section className="result-header">
        <h1>
          {result.winner === "informed"
            ? "The informed players win!"
            : "The hidden player wins!"}
        </h1>

        <p>
          {hiddenPlayer?.displayName ?? "Unknown player"} was the hidden player
        </p>

        <p>The secret was: {result.secretTip}</p>
      </section>

      <section>
        <h2>Voting results</h2>

        <table className="vote-table">
          <thead>
            <tr>
              <th>Player</th>
              <th className="votes">Votes</th>
            </tr>
          </thead>

          <tbody>
            {playersWithVotes.map((player) => {
              const isAccused = player.ref === result.accusedRef;

              return (
                <tr
                  key={player.ref}
                  className={isAccused ? "accused" : ""}
                >
                  <td>
                    {player.displayName}
                    {isAccused && (
                      <span className="accused-label">(Accused)</span>
                    )}
                  </td>

                  <td className="votes">{player.votes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}