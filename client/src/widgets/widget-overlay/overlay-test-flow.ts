import type { MatchResult } from './widget-overlay';

export type OverlayTestFlowStep = {
  before: {
    skillLevel: number;
    elo: number;
  };
  after: {
    skillLevel: number;
    elo: number;
  };
  result: MatchResult['result'];
};

export const OVERLAY_TEST_FLOW: OverlayTestFlowStep[] = [
  { before: { skillLevel: 7, elo: 1528 }, after: { skillLevel: 8, elo: 1553 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1553 }, after: { skillLevel: 7, elo: 1529 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1529 }, after: { skillLevel: 8, elo: 1552 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1552 }, after: { skillLevel: 7, elo: 1530 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1530 }, after: { skillLevel: 8, elo: 1560 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1560 }, after: { skillLevel: 8, elo: 1531 }, result: 'LOSS' },
  { before: { skillLevel: 8, elo: 1531 }, after: { skillLevel: 7, elo: 1510 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1510 }, after: { skillLevel: 8, elo: 1538 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1538 }, after: { skillLevel: 7, elo: 1511 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1511 }, after: { skillLevel: 8, elo: 1537 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1537 }, after: { skillLevel: 7, elo: 1512 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1512 }, after: { skillLevel: 8, elo: 1536 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1536 }, after: { skillLevel: 7, elo: 1513 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1513 }, after: { skillLevel: 8, elo: 1535 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1535 }, after: { skillLevel: 7, elo: 1505 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1505 }, after: { skillLevel: 8, elo: 1534 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1534 }, after: { skillLevel: 7, elo: 1506 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1506 }, after: { skillLevel: 8, elo: 1533 }, result: 'WIN' },
  { before: { skillLevel: 8, elo: 1533 }, after: { skillLevel: 7, elo: 1507 }, result: 'LOSS' },
  { before: { skillLevel: 7, elo: 1507 }, after: { skillLevel: 7, elo: 1528 }, result: 'WIN' },
];
