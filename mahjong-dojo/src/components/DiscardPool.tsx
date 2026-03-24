"use client";

import type { Tile as TileType } from "@/lib/tiles";
import Tile from "./Tile";

interface DiscardPoolProps {
  tiles: TileType[];
  columns?: number;
  size?: "sm" | "md" | "lg";
  onTileClick?: (tile: TileType) => void;
}

export default function DiscardPool({
  tiles,
  columns = 6,
  size = "sm",
  onTileClick,
}: DiscardPoolProps) {
  return (
    <div
      className="grid gap-0.5"
      style={{ gridTemplateColumns: `repeat(${columns}, max-content)` }}
    >
      {tiles.map((tile) => (
        <Tile
          key={tile.id}
          face={tile.face}
          size={size}
          onClick={onTileClick ? () => onTileClick(tile) : undefined}
        />
      ))}
    </div>
  );
}
