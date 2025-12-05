"use client";

export type BaseUserContext = {
  address: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export function useBaseUserContext(): BaseUserContext {
  // TODO: intégrer MiniKit / Context API ici
  // Pour l'instant: mock pour dev local.
  return {
    address: "0x1234...ABCD",
    displayName: "Base Baller",
    avatarUrl: null,
  };
}
