import { describe, it, expect } from "vitest";
import {
  calculateBasePoints,
  calculatePayments,
  calculateFu,
} from "../scoring";

describe("Base points", () => {
  it("calculates yakuman as 8000 base points", () => {
    expect(calculateBasePoints(13, 30)).toBe(8000);
  });

  it("calculates mangan at 5 han", () => {
    expect(calculateBasePoints(5, 30)).toBe(2000);
  });

  it("calculates haneman at 6-7 han", () => {
    expect(calculateBasePoints(6, 30)).toBe(3000);
    expect(calculateBasePoints(7, 30)).toBe(3000);
  });

  it("calculates baiman at 8-10 han", () => {
    expect(calculateBasePoints(8, 30)).toBe(4000);
    expect(calculateBasePoints(10, 30)).toBe(4000);
  });

  it("calculates sanbaiman at 11-12 han", () => {
    expect(calculateBasePoints(11, 30)).toBe(6000);
    expect(calculateBasePoints(12, 30)).toBe(6000);
  });

  it("calculates normal points for low han", () => {
    // 1 han 30 fu = 30 * 2^3 = 240
    expect(calculateBasePoints(1, 30)).toBe(240);
    // 2 han 30 fu = 30 * 2^4 = 480
    expect(calculateBasePoints(2, 30)).toBe(480);
    // 3 han 30 fu = 30 * 2^5 = 960
    expect(calculateBasePoints(3, 30)).toBe(960);
  });
});

describe("Payment calculation", () => {
  it("calculates ron payment for non-dealer", () => {
    const base = 2000; // mangan
    const result = calculatePayments(base, false, false, 0);
    // Non-dealer ron: base * 4 = 8000
    expect(result.total).toBe(8000);
  });

  it("calculates ron payment for dealer", () => {
    const base = 2000; // mangan
    const result = calculatePayments(base, true, false, 0);
    // Dealer ron: base * 6 = 12000
    expect(result.total).toBe(12000);
  });

  it("calculates tsumo payment for non-dealer", () => {
    const base = 2000; // mangan
    const result = calculatePayments(base, false, true, 0);
    // Non-dealer tsumo: 2 × ceil(base) + ceil(base × 2)
    // = 2 × 2000 + 4000 = 8000
    expect(result.total).toBe(8000);
  });

  it("adds honba bonus", () => {
    const base = 2000;
    const result = calculatePayments(base, false, false, 1);
    // 8000 + 300 = 8300
    expect(result.total).toBe(8300);
  });
});

describe("Fu calculation", () => {
  it("returns 25 for chiitoitsu", () => {
    expect(calculateFu(false, true, false, true)).toBe(25);
  });

  it("returns 20 for pinfu tsumo", () => {
    expect(calculateFu(true, true, true, false)).toBe(20);
  });

  it("returns 30 for pinfu ron", () => {
    expect(calculateFu(false, true, true, false)).toBe(30);
  });
});
