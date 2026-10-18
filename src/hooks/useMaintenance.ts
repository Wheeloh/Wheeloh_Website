"use client";
import { useEffect, useState } from "react";

export interface MaintenanceState {
  active: boolean;
  message: string;
}

// Fetched once per page load and shared by every store button / banner.
let pending: Promise<MaintenanceState> | null = null;

function load(): Promise<MaintenanceState> {
  if (!pending) {
    pending = fetch(`/maintenance.json?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => ({ active: !!data.active, message: String(data.message ?? "") }))
      .catch(() => ({ active: false, message: "" }));
  }
  return pending;
}

export function useMaintenance(): MaintenanceState {
  const [state, setState] = useState<MaintenanceState>({ active: false, message: "" });
  useEffect(() => {
    let alive = true;
    load().then((s) => alive && setState(s));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
