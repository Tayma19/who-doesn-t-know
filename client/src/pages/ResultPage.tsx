import type { ScreenProps } from "../types";

export default function ResultPage({ state }: ScreenProps) {
  const result = state.result;

  if (!result) {
    return (
      <main className="mx-auto max-w-2xl p-6 text-center">
        <h1 className="text-2xl font-bold">
          Results aren't available yet.
        </h1>
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
    <main className="mx-auto max-w-2xl p-6 font-sans">
      <section className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold">
          {result.winner === "informed"
            ? "The informed players win!"
            : "The hidden player wins!"}
        </h1>

        <p className="mb-2 text-lg">
          {hiddenPlayer?.displayName ?? "Unknown player"} was the hidden player
        </p>

        <p className="text-gray-600">
          The secret was: {result.secretTip}
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Voting results</h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3 text-right">Votes</th>
              </tr>
            </thead>

            <tbody>
              {playersWithVotes.map((player) => {
                const isAccused = player.ref === result.accusedRef;

                return (
                  <tr
                    key={player.ref}
                    className={
                      isAccused
                        ? "bg-yellow-100 font-semibold"
                        : "border-t border-gray-200"
                    }
                  >
                    <td className="px-4 py-3">
                      {player.displayName}
                      {isAccused && (
                        <span className="ml-2 text-sm text-yellow-800">
                          (Accused)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {player.votes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}