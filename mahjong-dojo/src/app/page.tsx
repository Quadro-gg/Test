"use client";

import { useState, useMemo } from "react";
import { createFullTileSet, shuffleTiles, sortTiles } from "@/lib/tiles";
import type { Tile as TileType } from "@/lib/tiles";
import Hand from "@/components/Hand";
import DiscardPool from "@/components/DiscardPool";

export default function Home() {
  const fullSet = useMemo(() => createFullTileSet(), []);
  const [hand, setHand] = useState<TileType[]>([]);
  const [discards, setDiscards] = useState<TileType[]>([]);
  const [wall, setWall] = useState<TileType[]>([]);

  function dealHand() {
    const shuffled = shuffleTiles(fullSet);
    setHand(shuffled.slice(0, 13));
    setWall(shuffled.slice(13));
    setDiscards([]);
  }

  function drawTile() {
    if (wall.length === 0) return;
    setHand((prev) => [...prev, wall[0]]);
    setWall((prev) => prev.slice(1));
  }

  function discardTile(tile: TileType) {
    setHand((prev) => prev.filter((t) => t.id !== tile.id));
    setDiscards((prev) => [...prev, tile]);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Mahjong Dojo</h1>
        <p className="text-gray-600">
          Learn and master Riichi Mahjong — interactive lessons, drills, and AI
          games.
        </p>
      </div>

      {/* Tile sandbox */}
      <section className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Tile Sandbox</h2>
          <button
            onClick={dealHand}
            className="px-4 py-1.5 bg-emerald-700 text-white rounded text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            Deal Hand
          </button>
          {hand.length > 0 && hand.length < 14 && (
            <button
              onClick={drawTile}
              className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-500 transition-colors"
            >
              Draw Tile ({wall.length} left)
            </button>
          )}
        </div>

        {hand.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Your Hand ({hand.length} tiles)
              {hand.length > 13 && " — click a tile to discard"}
            </h3>
            <Hand
              tiles={hand}
              size="lg"
              selectable={hand.length > 13}
              onTileClick={hand.length > 13 ? discardTile : undefined}
            />
          </div>
        )}

        {discards.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Discards ({discards.length})
            </h3>
            <DiscardPool tiles={discards} size="md" />
          </div>
        )}
      </section>

      {/* Full tile reference */}
      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold">All 136 Tiles</h2>
        <p className="text-sm text-gray-500">
          The complete Riichi Mahjong tile set — 3 suits (9 values &times; 4
          copies) + 4 winds &times; 4 + 3 dragons &times; 4
        </p>
        <Hand tiles={sortTiles(fullSet.slice(0, 36))} size="sm" sorted={false} />
        <Hand tiles={sortTiles(fullSet.slice(36, 72))} size="sm" sorted={false} />
        <Hand tiles={sortTiles(fullSet.slice(72, 108))} size="sm" sorted={false} />
        <Hand tiles={sortTiles(fullSet.slice(108))} size="sm" sorted={false} />
      </section>
    </div>
  );
}
