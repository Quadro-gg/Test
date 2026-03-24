import { describe, it, expect } from "vitest";
import {
  createFullTileSet,
  shuffleTiles,
  sortTiles,
  tileCode,
  tileLabel,
  tileSortKey,
} from "@/lib/tiles";

describe("Tile Set", () => {
  it("creates exactly 136 tiles", () => {
    const tiles = createFullTileSet();
    expect(tiles).toHaveLength(136);
  });

  it("has unique IDs for all tiles", () => {
    const tiles = createFullTileSet();
    const ids = new Set(tiles.map((t) => t.id));
    expect(ids.size).toBe(136);
  });

  it("has 108 suited tiles (3 suits × 9 values × 4 copies)", () => {
    const tiles = createFullTileSet();
    const suited = tiles.filter((t) => t.face.type === "suited");
    expect(suited).toHaveLength(108);
  });

  it("has 16 wind tiles (4 winds × 4 copies)", () => {
    const tiles = createFullTileSet();
    const winds = tiles.filter((t) => t.face.type === "wind");
    expect(winds).toHaveLength(16);
  });

  it("has 12 dragon tiles (3 dragons × 4 copies)", () => {
    const tiles = createFullTileSet();
    const dragons = tiles.filter((t) => t.face.type === "dragon");
    expect(dragons).toHaveLength(12);
  });

  it("shuffles tiles into different order", () => {
    const tiles = createFullTileSet();
    const shuffled = shuffleTiles(tiles);
    expect(shuffled).toHaveLength(136);
    // Very unlikely to be the same order
    const sameOrder = tiles.every((t, i) => t.id === shuffled[i].id);
    expect(sameOrder).toBe(false);
  });

  it("generates correct tile codes", () => {
    expect(tileCode({ type: "suited", suit: "man", value: 1 })).toBe("1m");
    expect(tileCode({ type: "suited", suit: "pin", value: 5 })).toBe("5p");
    expect(tileCode({ type: "suited", suit: "sou", value: 9 })).toBe("9s");
    expect(tileCode({ type: "wind", value: "east" })).toBe("We");
    expect(tileCode({ type: "dragon", value: "red" })).toBe("Dr");
  });

  it("generates correct tile labels", () => {
    expect(tileLabel({ type: "suited", suit: "man", value: 1 })).toBe("1 Man");
    expect(tileLabel({ type: "wind", value: "east" })).toBe("East Wind");
    expect(tileLabel({ type: "dragon", value: "white" })).toBe("White Dragon");
  });
});
