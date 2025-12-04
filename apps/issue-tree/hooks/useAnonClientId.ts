"use client";

import { useState, useEffect } from "react";

const ANON_CLIENT_ID_KEY = "issue-tree-anon-client-id";

function generateClientId(): string {
  return crypto.randomUUID();
}

export function useAnonClientId(): string | null {
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(ANON_CLIENT_ID_KEY);
    if (!id) {
      id = generateClientId();
      localStorage.setItem(ANON_CLIENT_ID_KEY, id);
    }
    setClientId(id);
  }, []);

  return clientId;
}
