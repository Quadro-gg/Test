"use client";

import type { GameState, CallOption } from "@/engine/types";
import type { AIDifficulty } from "@/engine/ai";
import Tile from "@/components/Tile";
import Hand from "@/components/Hand";
import DiscardPool from "@/components/DiscardPool";
import type { Tile as TileType } from "@/lib/tiles";
import { sortTiles, tileCode } from "@/lib/tiles";
import { calculateShanten, findWaits } from "@/engine/hand-utils";

interface GameBoardProps {
  state: GameState;
  humanPlayer: number;
  callOptions: CallOption[];
  canRiichi: boolean;
  canTsumo: boolean;
  showHint: boolean;
  roundResult: string | null;
  onDiscard: (tileId: number) => void;
  onRiichi: (tileId: number) => void;
  onTsumo: () => void;
  onCall: (call: CallOption) => void;
  onPass: () => void;
  onToggleHint: () => void;
  onNextRound: () => void;
}

const WIND_LABELS = ["East", "South", "West", "North"];
const WIND_KANJI = ["東", "南", "西", "北"];

export default function GameBoard({
  state,
  humanPlayer,
  callOptions,
  canRiichi,
  canTsumo,
  showHint,
  roundResult,
  onDiscard,
  onRiichi,
  onTsumo,
  onCall,
  onPass,
  onToggleHint,
  onNextRound,
}: GameBoardProps) {
  const human = state.players[humanPlayer];
  const isMyTurn = state.currentPlayer === humanPlayer;
  const canDiscard = isMyTurn && state.phase === "discarding" && human.hand.length === 14;

  // Calculate hint
  const hintTileId = showHint && canDiscard ? getBestDiscardId(human.hand) : null;

  // Relative positions: bottom = human, right = next, top = across, left = prev
  const positions = [0, 1, 2, 3].map((i) => (humanPlayer + i) % 4);

  return (
    <div className="space-y-4">
      {/* Round result overlay */}
      {roundResult && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-lg font-bold text-amber-800">{roundResult}</p>
          <div className="mt-2 flex gap-2 justify-center">
            {state.phase !== "game-end" && (
              <button
                onClick={onNextRound}
                className="px-4 py-2 bg-emerald-700 text-white rounded text-sm font-medium hover:bg-emerald-600"
              >
                Next Round
              </button>
            )}
          </div>
        </div>
      )}

      {/* Game info bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 bg-white rounded p-2">
        <span>
          {WIND_LABELS[["east", "south", "west", "north"].indexOf(state.round.roundWind)]}{" "}
          {state.round.roundNumber} | Honba: {state.round.honba} | Riichi sticks: {state.round.riichiSticks}
        </span>
        <span>Wall: {state.wall.length} tiles</span>
        <button
          onClick={onToggleHint}
          className={`px-2 py-1 rounded text-xs ${showHint ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}
        >
          {showHint ? "Hints ON" : "Hints OFF"}
        </button>
      </div>

      {/* Dora indicators */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Dora:</span>
        {state.doraIndicators.map((tile, i) => (
          <Tile key={i} face={tile.face} size="sm" />
        ))}
      </div>

      {/* Opponent areas */}
      <div className="grid grid-cols-3 gap-4">
        {/* Left opponent */}
        <OpponentArea
          player={state.players[positions[3]]}
          label={`${WIND_KANJI[["east", "south", "west", "north"].indexOf(state.players[positions[3]].seatWind)]} ${WIND_LABELS[["east", "south", "west", "north"].indexOf(state.players[positions[3]].seatWind)]}`}
          isActive={state.currentPlayer === positions[3]}
        />

        {/* Top opponent */}
        <OpponentArea
          player={state.players[positions[2]]}
          label={`${WIND_KANJI[["east", "south", "west", "north"].indexOf(state.players[positions[2]].seatWind)]} ${WIND_LABELS[["east", "south", "west", "north"].indexOf(state.players[positions[2]].seatWind)]}`}
          isActive={state.currentPlayer === positions[2]}
        />

        {/* Right opponent */}
        <OpponentArea
          player={state.players[positions[1]]}
          label={`${WIND_KANJI[["east", "south", "west", "north"].indexOf(state.players[positions[1]].seatWind)]} ${WIND_LABELS[["east", "south", "west", "north"].indexOf(state.players[positions[1]].seatWind)]}`}
          isActive={state.currentPlayer === positions[1]}
        />
      </div>

      {/* Score board */}
      <div className="flex justify-between text-xs bg-white rounded p-2">
        {state.players.map((p, i) => (
          <span
            key={i}
            className={`${i === humanPlayer ? "font-bold text-emerald-700" : "text-gray-500"} ${
              state.currentPlayer === i ? "underline" : ""
            }`}
          >
            {WIND_KANJI[["east", "south", "west", "north"].indexOf(p.seatWind)]} {p.points.toLocaleString()}
            {p.riichiDeclared && " R"}
          </span>
        ))}
      </div>

      {/* Human hand */}
      <div className="bg-white rounded-lg shadow p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            Your Hand ({WIND_LABELS[["east", "south", "west", "north"].indexOf(human.seatWind)]})
            {isMyTurn && " — Your turn"}
          </span>
          {canDiscard && (
            <span className="text-xs text-gray-400">
              Shanten: {calculateShanten(human.hand.map((t) => t.face))}
            </span>
          )}
        </div>

        <div className="flex gap-0.5 flex-wrap items-end">
          {sortTiles(human.hand.slice(0, 13)).map((tile) => (
            <div
              key={tile.id}
              className={`${hintTileId === tile.id ? "ring-2 ring-amber-300 rounded" : ""}`}
            >
              <Tile
                face={tile.face}
                size="lg"
                onClick={canDiscard ? () => onDiscard(tile.id) : undefined}
              />
            </div>
          ))}
          {human.hand.length === 14 && (
            <div className="ml-3">
              <div className={`${hintTileId === human.hand[13]?.id ? "ring-2 ring-amber-300 rounded" : ""}`}>
                <Tile
                  face={human.hand[human.hand.length - 1].face}
                  size="lg"
                  onClick={canDiscard ? () => onDiscard(human.hand[human.hand.length - 1].id) : undefined}
                />
              </div>
            </div>
          )}
        </div>

        {/* Open melds */}
        {human.melds.length > 0 && (
          <div className="flex gap-4">
            {human.melds.map((meld, i) => (
              <div key={i} className="flex gap-0.5">
                {meld.tiles.map((t, j) => (
                  <Tile key={j} face={t.face} size="md" />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Your discards */}
        {human.discards.length > 0 && (
          <div>
            <span className="text-xs text-gray-400">Your discards:</span>
            <DiscardPool tiles={human.discards} size="sm" />
          </div>
        )}
      </div>

      {/* Action bar */}
      <ActionBar
        canDiscard={canDiscard}
        canRiichi={canRiichi}
        canTsumo={canTsumo}
        callOptions={callOptions}
        human={human}
        onRiichi={onRiichi}
        onTsumo={onTsumo}
        onCall={onCall}
        onPass={onPass}
      />
    </div>
  );
}

// ─── Opponent Area ─────────────────────────────────────────

function OpponentArea({
  player,
  label,
  isActive,
}: {
  player: import("@/engine/types").PlayerState;
  label: string;
  isActive: boolean;
}) {
  return (
    <div className={`bg-white rounded-lg p-3 ${isActive ? "ring-2 ring-emerald-300" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs text-gray-400">
          {player.points.toLocaleString()}
          {player.riichiDeclared && " R"}
        </span>
      </div>
      {/* Face-down tiles */}
      <div className="flex gap-px flex-wrap">
        {Array.from({ length: player.hand.length }).map((_, i) => (
          <Tile key={i} face={{ type: "suited", suit: "man", value: 1 }} size="sm" faceDown />
        ))}
      </div>
      {/* Open melds */}
      {player.melds.length > 0 && (
        <div className="flex gap-2 mt-1">
          {player.melds.map((meld, i) => (
            <div key={i} className="flex gap-px">
              {meld.tiles.map((t, j) => (
                <Tile key={j} face={t.face} size="sm" />
              ))}
            </div>
          ))}
        </div>
      )}
      {/* Discards */}
      {player.discards.length > 0 && (
        <div className="mt-2">
          <DiscardPool tiles={player.discards} size="sm" columns={6} />
        </div>
      )}
    </div>
  );
}

// ─── Action Bar ────────────────────────────────────────────

function ActionBar({
  canDiscard,
  canRiichi,
  canTsumo,
  callOptions,
  human,
  onRiichi,
  onTsumo,
  onCall,
  onPass,
}: {
  canDiscard: boolean;
  canRiichi: boolean;
  canTsumo: boolean;
  callOptions: CallOption[];
  human: import("@/engine/types").PlayerState;
  onRiichi: (tileId: number) => void;
  onTsumo: () => void;
  onCall: (call: CallOption) => void;
  onPass: () => void;
}) {
  const hasActions = canTsumo || canRiichi || callOptions.length > 0;
  if (!hasActions) return null;

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex flex-wrap gap-2 items-center">
      {canTsumo && (
        <button
          onClick={onTsumo}
          className="px-4 py-2 bg-red-600 text-white rounded text-sm font-bold hover:bg-red-500 transition-colors"
        >
          Tsumo!
        </button>
      )}

      {canRiichi && (
        <button
          onClick={() => {
            // For simplicity, riichi discards the last drawn tile
            if (human.hand.length === 14) {
              onRiichi(human.hand[human.hand.length - 1].id);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-500 transition-colors"
        >
          Riichi!
        </button>
      )}

      {callOptions.map((call, i) => (
        <button
          key={i}
          onClick={() => onCall(call)}
          className="px-4 py-2 bg-amber-500 text-white rounded text-sm font-bold hover:bg-amber-400 transition-colors"
        >
          {call.type === "ron" ? "Ron!" : call.type === "chi" ? "Chi" : call.type === "pon" ? "Pon" : "Kan"}
        </button>
      ))}

      {callOptions.length > 0 && (
        <button
          onClick={onPass}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Pass
        </button>
      )}
    </div>
  );
}

// ─── Hint helper ───────────────────────────────────────────

function getBestDiscardId(hand: TileType[]): number | null {
  if (hand.length !== 14) return null;

  let bestId = hand[0].id;
  let bestScore = -Infinity;

  const seen = new Set<string>();
  for (const tile of hand) {
    const code = tileCode(tile.face);
    if (seen.has(code)) continue;
    seen.add(code);

    const remaining = hand.filter((t) => t.id !== tile.id).map((t) => t.face);
    const shanten = calculateShanten(remaining);
    const waits = findWaits(remaining);
    const score = -shanten * 100 + waits.length * 10;

    if (score > bestScore) {
      bestScore = score;
      bestId = tile.id;
    }
  }

  return bestId;
}
