// Engine public API — re-export everything needed
export type {
  GameState,
  PlayerState,
  RoundInfo,
  Meld,
  CallOption,
  CallType,
  WinResult,
  YakuResult,
  Wind,
} from "./types";

export {
  createInitialGameState,
  drawTile,
  discardTile,
  declareRiichi,
  processCall,
  passCalls,
  getAvailableActions,
  startNextRound,
} from "./game";

export {
  isComplete,
  isSevenPairs,
  isThirteenOrphans,
  calculateShanten,
  findWaits,
  tileAcceptance,
  facesEqual,
  isTerminal,
  isHonor,
  isSimple,
  isTerminalOrHonor,
  faceToIndex,
  indexToFace,
} from "./hand-utils";

export { evaluateYaku } from "./yaku";
export type { YakuContext } from "./yaku";

export { calculateBasePoints, calculatePayments, scoreHand } from "./scoring";

export { detectCalls, detectSelfActions } from "./calls";
