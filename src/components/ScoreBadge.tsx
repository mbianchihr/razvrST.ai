import type { Tier } from "@/lib/types";

const SEAL: Record<Tier, string> = {
  A: "var(--seal-A)",
  B: "var(--seal-B)",
  C: "var(--seal-C)",
  D: "var(--seal-D)",
  F: "var(--seal-F)",
};

export function ScoreBadge({ tier, size = 60 }: { tier: Tier; size?: number }) {
  return (
    <span
      className="seal"
      style={{
        width: size,
        height: size,
        background: SEAL[tier],
        fontSize: size * 0.46,
      }}
    >
      {tier}
    </span>
  );
}
