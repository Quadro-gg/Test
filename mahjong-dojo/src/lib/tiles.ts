// ─── Tile Types ────────────────────────────────────────────

export type Suit = "man" | "pin" | "sou";
export type WindValue = "east" | "south" | "west" | "north";
export type DragonValue = "white" | "green" | "red";
export type HonorValue = WindValue | DragonValue;

export type TileType = "suited" | "wind" | "dragon";

export interface SuitedTile {
  type: "suited";
  suit: Suit;
  value: number; // 1-9
}

export interface WindTile {
  type: "wind";
  value: WindValue;
}

export interface DragonTile {
  type: "dragon";
  value: DragonValue;
}

export type TileFace = SuitedTile | WindTile | DragonTile;

export interface Tile {
  id: number; // 0-135, unique identifier for each physical tile
  face: TileFace;
}

// ─── Display Helpers ───────────────────────────────────────

const SUIT_LABELS: Record<Suit, string> = {
  man: "Man",
  pin: "Pin",
  sou: "Sou",
};

const WIND_LABELS: Record<WindValue, string> = {
  east: "East",
  south: "South",
  west: "West",
  north: "North",
};

const DRAGON_LABELS: Record<DragonValue, string> = {
  white: "White",
  green: "Green",
  red: "Red",
};

export function tileLabel(face: TileFace): string {
  switch (face.type) {
    case "suited":
      return `${face.value} ${SUIT_LABELS[face.suit]}`;
    case "wind":
      return `${WIND_LABELS[face.value]} Wind`;
    case "dragon":
      return `${DRAGON_LABELS[face.value]} Dragon`;
  }
}

/** Short code for sorting and comparison, e.g. "1m", "5p", "Ew", "Dw" */
export function tileCode(face: TileFace): string {
  switch (face.type) {
    case "suited":
      return `${face.value}${face.suit[0]}`;
    case "wind":
      return `W${face.value[0]}`;
    case "dragon":
      return `D${face.value[0]}`;
  }
}

/** Numeric sort key for ordering tiles in hand */
export function tileSortKey(face: TileFace): number {
  switch (face.type) {
    case "suited": {
      const suitOrder = { man: 0, pin: 1, sou: 2 };
      return suitOrder[face.suit] * 10 + face.value;
    }
    case "wind": {
      const windOrder = { east: 0, south: 1, west: 2, north: 3 };
      return 100 + windOrder[face.value];
    }
    case "dragon": {
      const dragonOrder = { white: 0, green: 1, red: 2 };
      return 110 + dragonOrder[face.value];
    }
  }
}

// ─── Full Tile Set (136 tiles) ─────────────────────────────

export function createFullTileSet(): Tile[] {
  const tiles: Tile[] = [];
  let id = 0;

  const suits: Suit[] = ["man", "pin", "sou"];

  // 4 copies of each suited tile (1-9 in each suit = 108 tiles)
  for (const suit of suits) {
    for (let value = 1; value <= 9; value++) {
      for (let copy = 0; copy < 4; copy++) {
        tiles.push({ id: id++, face: { type: "suited", suit, value } });
      }
    }
  }

  // 4 copies of each wind (16 tiles)
  const winds: WindValue[] = ["east", "south", "west", "north"];
  for (const value of winds) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push({ id: id++, face: { type: "wind", value } });
    }
  }

  // 4 copies of each dragon (12 tiles)
  const dragons: DragonValue[] = ["white", "green", "red"];
  for (const value of dragons) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push({ id: id++, face: { type: "dragon", value } });
    }
  }

  return tiles; // 136 total
}

/** Fisher-Yates shuffle */
export function shuffleTiles(tiles: Tile[]): Tile[] {
  const arr = [...tiles];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Sort tiles by suit then value for display */
export function sortTiles(tiles: Tile[]): Tile[] {
  return [...tiles].sort((a, b) => tileSortKey(a.face) - tileSortKey(b.face));
}
