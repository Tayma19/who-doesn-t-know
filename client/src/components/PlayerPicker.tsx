import type { PublicPlayer } from "../types";
import "./PlayerPicker.css";

interface PlayerPickerProps {
  players: PublicPlayer[];
  excludedRef: number;
  value: number | null;
  onChange: (playerRef: number | null) => void;
  disabled?: boolean;
}

export default function PlayerPicker({
  players,
  excludedRef,
  value,
  onChange,
  disabled = false,
}: PlayerPickerProps) {
  const availablePlayers = players.filter(
    (player) => player.ref !== excludedRef,
  );

  return (
    <div className="player-picker">
      <label className="player-picker__label" htmlFor="player-picker">
        Choose a player
      </label>

      <select
        id="player-picker"
        className="player-picker__select"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => {
          const selectedValue = event.target.value;
          onChange(selectedValue ? Number(selectedValue) : null);
        }}
      >
        <option value="">Select a player</option>

        {availablePlayers.map((player) => (
          <option key={player.ref} value={player.ref}>
            {player.displayName}
          </option>
        ))}
      </select>
    </div>
  );
}
