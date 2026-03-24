"use client";

import { useState } from "react";
import type { Tile as TileType } from "@/lib/tiles";
import { sortTiles } from "@/lib/tiles";
import Tile from "./Tile";

interface HandProps {
  tiles: TileType[];
  size?: "sm" | "md" | "lg";
  onTileClick?: (tile: TileType) => void;
  selectable?: boolean;
  sorted?: boolean;
}

export default function Hand({
  tiles,
  size = "md",
  onTileClick,
  selectable = false,
  sorted = true,
}: HandProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const displayTiles = sorted ? sortTiles(tiles) : tiles;

  function handleClick(tile: TileType) {
    if (selectable) {
      setSelectedId(selectedId === tile.id ? null : tile.id);
    }
    onTileClick?.(tile);
  }

  return (
    <div className="flex gap-0.5 flex-wrap items-end">
      {displayTiles.map((tile) => (
        <Tile
          key={tile.id}
          face={tile.face}
          size={size}
          selected={selectable && selectedId === tile.id}
          onClick={() => handleClick(tile)}
        />
      ))}
    </div>
  );
}
