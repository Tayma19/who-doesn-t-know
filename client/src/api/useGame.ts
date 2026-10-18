import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMe, getState } from "./state.api";
import { loadSession } from "../api/session";
import type { PrivateRoleView, PublicGameState } from "../types";

const POLL_MS = 2000;

export function useGame(roomCode: string) {
  const session = useMemo(() => loadSession(roomCode), [roomCode]);

  const [state, setState] = useState<PublicGameState | null>(null);
  const [me, setMe] = useState<PrivateRoleView | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(session !== null);

  const alive = useRef(true);

  const refresh = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }
    try {
      const [s, m] = await Promise.all([getState(roomCode), getMe(session)]);
      if (!alive.current) return;
      setState(s);
      setMe(m);
      setError(null);
    } catch (e) {
      if (!alive.current) return;
      setError(e instanceof Error ? e : new Error("Request failed"));
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [roomCode, session]);

  useEffect(() => {
    alive.current = true;
    void refresh();
    const id = setInterval(() => void refresh(), POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [refresh]);

  return { state, me, session, refresh, error, loading };
}
