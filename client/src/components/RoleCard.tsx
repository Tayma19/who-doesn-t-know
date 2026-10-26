
import type { PrivateRoleView } from "../types";
import "../style/RoleCard.css";

interface RoleCardProps {
  me: PrivateRoleView;
}

export default function RoleCard({ me }: RoleCardProps) {
  if (me.role === "hidden") {
    return (
      <section className="role-card role-card--hidden">
        <p className="role-card__label">Your role</p>
        <h2 className="role-card__title">Hidden Player</h2>
        <p className="role-card__message">
          You don't know the secret. Blend in!
        </p>
      </section>
    );
  }

  if (me.role === "informed") {
    return (
      <section className="role-card role-card--informed">
        <p className="role-card__label">Your role</p>
        <h2 className="role-card__title">Informed Player</h2>
        <p className="role-card__secret">
          <span className="role-card__secret-label">The secret:</span>{" "}
          <strong className="role-card__tip">
            {me.secretTip ?? "Not available"}
          </strong>
        </p>
      </section>
    );
  }

  return (
    <section className="role-card role-card--waiting">
      <p className="role-card__label">Your role</p>
      <h2 className="role-card__title">Waiting for your role</h2>
      <p className="role-card__message">
        Your role will appear when the game begins.
      </p>
    </section>
  );
}
