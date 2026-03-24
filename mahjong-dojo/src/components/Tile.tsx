"use client";

import type { TileFace, Suit } from "@/lib/tiles";
import { tileLabel } from "@/lib/tiles";

// ─── Color & Symbol Mapping ───────────────────────────────

const SUIT_COLORS: Record<Suit, string> = {
  man: "#e74c3c", // red
  pin: "#2980b9", // blue
  sou: "#27ae60", // green
};

const SUIT_KANJI: Record<Suit, string> = {
  man: "萬",
  pin: "筒",
  sou: "索",
};

const WIND_KANJI: Record<string, string> = {
  east: "東",
  south: "南",
  west: "西",
  north: "北",
};

const DRAGON_DISPLAY: Record<string, { char: string; color: string }> = {
  white: { char: "白", color: "#888" },
  green: { char: "發", color: "#27ae60" },
  red: { char: "中", color: "#e74c3c" },
};

// ─── Tile Component ───────────────────────────────────────

interface TileProps {
  face: TileFace;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
  faceDown?: boolean;
}

const SIZES = {
  sm: { w: 32, h: 44 },
  md: { w: 44, h: 60 },
  lg: { w: 56, h: 76 },
};

export default function Tile({
  face,
  size = "md",
  selected = false,
  onClick,
  faceDown = false,
}: TileProps) {
  const { w, h } = SIZES[size];
  const fontSize = size === "sm" ? 11 : size === "md" ? 15 : 19;
  const subFontSize = size === "sm" ? 8 : size === "md" ? 10 : 13;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={`cursor-pointer transition-transform ${
        selected ? "-translate-y-2" : ""
      } ${onClick ? "hover:-translate-y-1" : ""}`}
      onClick={onClick}
      role="img"
      aria-label={faceDown ? "Face-down tile" : tileLabel(face)}
    >
      {/* Tile body */}
      <rect
        x={1}
        y={1}
        width={w - 2}
        height={h - 2}
        rx={4}
        fill={faceDown ? "#2d6a4f" : "#fffff0"}
        stroke={selected ? "#f59e0b" : "#999"}
        strokeWidth={selected ? 2 : 1}
      />

      {!faceDown && (
        <>
          {face.type === "suited" && (
            <>
              <text
                x={w / 2}
                y={h * 0.4}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={fontSize}
                fontWeight="bold"
                fill={SUIT_COLORS[face.suit]}
              >
                {face.value}
              </text>
              <text
                x={w / 2}
                y={h * 0.72}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={subFontSize}
                fill={SUIT_COLORS[face.suit]}
              >
                {SUIT_KANJI[face.suit]}
              </text>
            </>
          )}

          {face.type === "wind" && (
            <text
              x={w / 2}
              y={h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize + 2}
              fontWeight="bold"
              fill="#333"
            >
              {WIND_KANJI[face.value]}
            </text>
          )}

          {face.type === "dragon" && (
            <text
              x={w / 2}
              y={h / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize + 2}
              fontWeight="bold"
              fill={DRAGON_DISPLAY[face.value].color}
            >
              {DRAGON_DISPLAY[face.value].char}
            </text>
          )}
        </>
      )}

      {faceDown && (
        <rect
          x={4}
          y={4}
          width={w - 8}
          height={h - 8}
          rx={2}
          fill="none"
          stroke="#1b4332"
          strokeWidth={1}
          opacity={0.5}
        />
      )}
    </svg>
  );
}
