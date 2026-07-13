import { test, expect } from "bun:test";
import { swapPositions, nextPosition } from "../../src/lib/cms/plan-items";

const items = [
  { id: "a", position: 1 },
  { id: "b", position: 2 },
  { id: "c", position: 3 },
];

test("moves an item down by swapping positions", () => {
  expect(swapPositions(items, "a", "down")).toEqual([
    { id: "a", position: 2 },
    { id: "b", position: 1 },
  ]);
});

test("moves an item up", () => {
  expect(swapPositions(items, "c", "up")).toEqual([
    { id: "c", position: 2 },
    { id: "b", position: 3 },
  ]);
});

test("no-op at the edges and for unknown ids", () => {
  expect(swapPositions(items, "a", "up")).toEqual([]);
  expect(swapPositions(items, "c", "down")).toEqual([]);
  expect(swapPositions(items, "zz", "down")).toEqual([]);
  expect(swapPositions([], "a", "up")).toEqual([]);
});

test("works with unsorted input and gapped positions", () => {
  const gapped = [
    { id: "y", position: 10 },
    { id: "x", position: 2 },
    { id: "z", position: 30 },
  ];
  expect(swapPositions(gapped, "y", "down")).toEqual([
    { id: "y", position: 30 },
    { id: "z", position: 10 },
  ]);
});

test("nextPosition appends after the max", () => {
  expect(nextPosition([])).toBe(1);
  expect(nextPosition(items)).toBe(4);
  expect(nextPosition([{ id: "x", position: 7 }])).toBe(8);
});
