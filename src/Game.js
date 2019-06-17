import { Game } from 'boardgame.io/core';
import {
  chunk,
  compact,
  flatten,
  isEqual,
  range,
} from 'lodash';

const initGrid = () => {
  // Create the initial range of numbers in chunks of 9
  return chunk([...range(1, 10), ...range(11, 20)]
    .join('')
    .split('')
    .map(Number)
  , 9);
}

const clearSelected = (G, ctx) => {
  // Clear the selection and the selected cells from the grid
  if (G.selection.length) {
    G.selection.forEach(sel => {
      G.grid[sel.row][sel.column] = 0;
    });
    G.selection = [];
    // Remove completely empty (cleared) rows from the grid
    G.grid = compactGrid(G.grid);
  }
  return G;
}

const canSelect = (G, selection) => {
  const existingSelection = G.selection[0];
  const firstValue = existingSelection.value;
  // If numbers are not equal or they don't equal ten, no point checking any further
  if (!hasSameValue(firstValue, selection.value) && !equalsTen(firstValue, selection.value)) {
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

const hasSameValue = (...args) => args.every((val, i, arr) => val === arr[0]);

const equalsTen = (...args) => args.reduce((acc, cur) => acc + cur) === 10;

const compactGrid = (grid) => {
  return grid.filter(row => !row.every(val => val === 0));
}

const Nmbrs = Game({

  setup: () => ({
    grid: initGrid(),
    selection: [],
  }),

  moves: {
    selectCell: (G, ctx, row, column) => {
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
    drawNewSet: (G, ctx) => {
      // Flatten grid, remove zero values and create chunks of 9
      const flattened = flatten(G.grid);
      const nonSolved = compact(flattened);
      let newGrid = chunk(flattened.concat(nonSolved), 9);
      // Remove completely empty (cleared) rows
      newGrid = compactGrid(newGrid);
      G.grid = newGrid;
    },
  },

  flow: {
    undoableMoves: ['selectCell'],
    startingPhase: 'selectCells',
    phases: {
      selectCells: {
        allowedMoves: ['selectCell', 'drawNewSet'],
        endPhaseIf: G => G.selection.length === 2,
        next: 'selectCells',
        onPhaseEnd: clearSelected,
        onTurnEnd: (G, ctx) => { G.selection = []; },
      },
    },
    endGameIf: (G, ctx) => {
      // Set victory condition: grid has only zero values
      const flattened = flatten(G.grid);
      const compacted = compact(flattened);
      if (compacted.length === 0) {
        return true;
      }
    }

  }

});

export default Nmbrs;
