
import type { Ctx, Game } from 'boardgame.io';
import {
  chunk,
  compact,
  flatten,
  isEqual,
  range,
} from 'lodash';

// Alias for Grid type.
type Grid = number[][];

// Selection object interface.
export interface Selection {
  row: number;
  column: number;
  value?: number;
}

// Game state interface.
export interface GameState {
  grid: Grid;
  selection: Selection[];
};

const initGrid = (): Grid => {
  // Create the initial range of numbers in chunks of 9
  return chunk([...range(1, 10), ...range(11, 20)]
    .join('')
    .split('')
    .map(Number)
  , 9);
}

const clearSelected = ({ G, ctx }: { G: any; ctx: Ctx}) => {
  // Clear the selection and the selected cells from the grid
  if (G.selection.length) {
    G.selection.forEach((sel: Selection) => {
      G.grid[sel.row][sel.column] = 0;
    });
    G.selection = [];
    // Remove completely empty (cleared) rows from the grid
    G.grid = compactGrid(G.grid);
  }
  return G;
}

const canSelect = (G: any, selection: Selection): boolean => {
  const existingSelection = G.selection[0];
  const firstValue = existingSelection.value;
  // If numbers are not equal or they don't equal ten, no point checking any further
  if (!hasSameValue(firstValue, selection.value || 0) && !equalsTen(firstValue, selection.value || 0)) {
    return false;
  }
  // Flip selection around if a higher row was selected first
  let lowerSelection = existingSelection;
  let higherSelection = selection;
  if (existingSelection.row > selection.row ||
    (existingSelection.row === selection.row && existingSelection.column > selection.column)
  ) {
    lowerSelection = selection;
    higherSelection = existingSelection;
  }
  // Check if selected cells are on same column
  if (lowerSelection.column === higherSelection.column) {
    // ... and on subsequent rows
    if (Math.abs(higherSelection.row - lowerSelection.row) === 1) {
      return true;
    }
    // Check if there are non-zero values in between
    for (let i = lowerSelection.row + 1; i < higherSelection.row; i++) {
      const rowValue = parseInt(G.grid[i][lowerSelection.column]);
      if (rowValue !== 0) {
        return false;
      }
    }
    return true;
  } else {
    // Check if selected cells are on same row and subsequent column
    if (lowerSelection.row === higherSelection.row &&
        Math.abs(lowerSelection.column - higherSelection.column) === 1
    ) {
      return true;
    }
    // Flatten array and test that all values between
    // start and end indices are 0
    const flattened = flatten(G.grid);
    const startIndex = lowerSelection.row * 9 + lowerSelection.column;
    const endIndex = higherSelection.row * 9 + higherSelection.column;
    const intermediateValues = flattened.slice(startIndex + 1, endIndex);
    return intermediateValues.every(val => val === 0);
  }
}

const hasSameValue = (...args: number[]): boolean => args.every((val, i, arr) => val === arr[0]);

const equalsTen = (...args: number[]): boolean => args.reduce((acc, cur) => acc + cur) === 10;

const compactGrid = (grid: Grid): Grid => {
  return grid.filter((row: number[]) => !row.every(val => val === 0));
}

export const Nmbrs: Game<GameState> = {

  name: 'NMBRS',

  setup: (): GameState => ({
    grid: initGrid(),
    selection: [],
  }),

  moves: {
    selectCell: {
      move: ({ G, ctx }, row, column) => {
        const value = G.grid[row][column];
        const selection = {
          row,
          column,
          value
        };
        // If no earlier selection yet, cell can always be selected
        if (G.selection.length === 0) {
          G.selection.push(selection);
        } else {
          // Undo selection if same cell selected again
          if (isEqual(G.selection[0], selection)) {
            G.selection = [];
            return;
          }
          if (canSelect(G, selection)) {
            G.selection.push(selection);
          }
        }
      },
      undoable: true,
    },
    drawNewSet: {
      move: ({ G, ctx }) => {
        // Flatten grid, remove zero values and create chunks of 9
        const flattened = flatten(G.grid);
        const nonSolved = compact(flattened);
        console.log(flattened, nonSolved, G);
        let newGrid: any[][] = chunk(flattened.concat(nonSolved), 9);
        console.log(newGrid);
        // Remove completely empty (cleared) rows
        newGrid = compactGrid(newGrid);
        console.log(newGrid);
        G.grid = newGrid;
      },
      undoable: false,
    },
  },

  phases: {
    selectCells: {
      endIf: ({ G }: { G: any }) => G.selection.length === 2,
      next: 'selectCells',
      onEnd: clearSelected,
      start: true,
    },
  },
  endIf: ({ G, ctx }) => {
    // Set victory condition: grid has only zero values
    const flattened = flatten(G.grid);
    const compacted = compact(flattened);
    if (compacted.length === 0) {
      return true;
    }
  },
  // turn: {
  //   minMoves: 2,
  // },
};

export default Nmbrs;
