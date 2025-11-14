"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "@/components/share";
import { url } from "@/lib/metadata";

const GRID_SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

function createEmptyGrid(): number[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

function addRandomTile(grid: number[][]): number[][] {
  const emptyCells: [number, number][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) emptyCells.push([r, c]);
    }
  }
  if (emptyCells.length === 0) return grid;
  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = TILE_VALUES[Math.random() < TILE_PROBABILITIES[0] ? 0 : 1];
  const newGrid = grid.map((row) => row.slice());
  newGrid[row][col] = value;
  return newGrid;
}

function transpose(grid: number[][]): number[][] {
  return grid[0].map((_, i) => grid.map((row) => row[i]));
}

function reverseRows(grid: number[][]): number[][] {
  return grid.map((row) => row.slice().reverse());
}

function slideAndMerge(row: number[]): { newRow: number[]; scoreDelta: number } {
  const nonZero = row.filter((v) => v !== 0);
  const merged: number[] = [];
  let scoreDelta = 0;
  for (let i = 0; i < nonZero.length; i++) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const mergedVal = nonZero[i] * 2;
      merged.push(mergedVal);
      scoreDelta += mergedVal;
      i++; // skip next
    } else {
      merged.push(nonZero[i]);
    }
  }
  while (merged.length < GRID_SIZE) merged.push(0);
  return { newRow: merged, scoreDelta };
}

function move(grid: number[][], direction: "up" | "down" | "left" | "right"): { newGrid: number[][]; scoreDelta: number } {
  let transformed = grid;
  if (direction === "up") transformed = transpose(grid);
  if (direction === "down") transformed = reverseRows(transpose(grid));
  if (direction === "right") transformed = reverseRows(grid);

  let scoreDelta = 0;
  const newTransformed = transformed.map((row) => {
    const { newRow, scoreDelta: rowDelta } = slideAndMerge(row);
    scoreDelta += rowDelta;
    return newRow;
  });

  let finalGrid = newTransformed;
  if (direction === "up") finalGrid = transpose(newTransformed);
  if (direction === "down") finalGrid = transpose(reverseRows(newTransformed));
  if (direction === "right") finalGrid = reverseRows(newTransformed);

  return { newGrid: finalGrid, scoreDelta };
}

function canMove(grid: number[][]): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return true;
      if (c + 1 < GRID_SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < GRID_SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

export default function Game() {
  const [grid, setGrid] = useState<number[][]>(() => {
    let g = createEmptyGrid();
    g = addRandomTile(g);
    g = addRandomTile(g);
    return g;
  });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const handleMove = (direction: "up" | "down" | "left" | "right") => {
    if (gameOver) return;
    const { newGrid, scoreDelta } = move(grid, direction);
    if (JSON.stringify(newGrid) === JSON.stringify(grid)) return; // no change
    const updatedGrid = addRandomTile(newGrid);
    setGrid(updatedGrid);
    setScore((s) => s + scoreDelta);
    if (!canMove(updatedGrid)) setGameOver(true);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") handleMove("up");
      if (e.key === "ArrowDown") handleMove("down");
      if (e.key === "ArrowLeft") handleMove("left");
      if (e.key === "ArrowRight") handleMove("right");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [grid, gameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-4 gap-2">
        {grid.flat().map((value, idx) => (
          <div
            key={idx}
            className={`flex h-12 w-12 items-center justify-center rounded-md border ${
              value
                ? "bg-teal-200 text-teal-900"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {value || null}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => handleMove("up")}>↑</Button>
        <Button onClick={() => handleMove("left")}>←</Button>
        <Button onClick={() => handleMove("right")}>→</Button>
        <Button onClick={() => handleMove("down")}>↓</Button>
      </div>
      <div className="text-xl">Score: {score}</div>
      {gameOver && (
        <div className="mt-4">
          <Share text={`I scored ${score} points in 2048! ${url}`} />
        </div>
      )}
    </div>
  );
}
