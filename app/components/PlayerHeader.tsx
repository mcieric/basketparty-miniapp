"use client";

import { BaseUserContext } from "../hooks/useBaseUserContext";

type Props = {
  user: BaseUserContext;
};

export function PlayerHeader({ user }: Props) {
  const shortAddress =
    user.address && user.address.length > 10
      ? `${user.address.slice(0, 6)}...${user.address.slice(-4)}`
      : user.address;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 999,
        background: "#020617",
        border: "1px solid #1e293b",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: user.avatarUrl
              ? `url(${user.avatarUrl}) center/cover no-repeat`
              : "radial-gradient(circle at 30% 30%, #38bdf8, #1d4ed8)",
            border: "2px solid #0f172a",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {user.displayName || "Player"}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{shortAddress}</div>
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#e5e7eb",
          textAlign: "right",
          maxWidth: 170,
        }}
      >
        1 free game/day · 0.1 USDC per extra game
      </div>
    </header>
  );
}
