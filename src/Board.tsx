import React from 'react';
import type { BoardProps } from 'boardgame.io/react';
import type { GameState } from './Game';
import { isEmpty, isEqual } from 'lodash';
import classNames from 'classnames';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import exampleImage from './example.png';
import githubLogo from './GitHub-Mark.png';
import './Board.css';

interface GameProps extends BoardProps<GameState> {};

export default function NmbrsBoard(props: GameProps) {

  const { events, moves, undo, reset, ctx, G } = props;

  // Click handlers
  const onCellClick = (row: number, column: number) => {
    moves.selectCell(row, column);
  }

  const onDrawNewClick = () => {
    moves.drawNewSet();
    events.endTurn?.();
  }

  const onUndoClick = () => {
    undo();
  }

  const onResetClick = () => {
    confirmAlert({
      title: 'Reset game',
      message: 'Are you sure?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => reset()
        },
        {
          label: 'No',
        }
      ]
    });
  }

  const onHelpClick = () => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="react-confirm-alert-body wider">
            <h1>Game info</h1>
            <div className="alert-content">
              <p>
                The goal of the game is to clear the entire grid by matching
                two cells. There are two ways to match:
              </p>
              <ul>
                <li>both numbers are the same</li>
                <li>the numbers combined equal 10.</li>
              </ul>
              <p>
                The following rules apply to which cells can be matched:
              </p>
              <ul>
                <li>cells are horizontally or vertically adjacent</li>
                <li>all cells between selected cells have been solved</li>
                <li>you can jump from one row to the next.</li>
              </ul>
              <p>
                When you can find no more cells to be matched, click
                "Draw new set" and start matching again.
              </p>
              <h2>Example</h2>
              <p>
                Cells that can be matched are highlighted with the same colour
                in the image below.
              </p>
              <img src={ exampleImage } alt="examples of matching cells" />
              <p>
                <a href="https://github.com/HPiirainen" rel="noopener noreferrer" target="_blank">
                  <img src={ githubLogo } alt="GitHub" width="32" height="32" />
                </a>
                <small>
                  &copy; Hermanni Piirainen
                </small>
              </p>
            </div>
            <div className="react-confirm-alert-button-group">
              <button onClick={ onClose }>Close</button>
            </div>
          </div>
        )
      }
    });
  }

  // Scroll event handler for resizing header
  const resizeHeaderOnScroll = () => {
    const distanceY = window.pageYOffset || document.documentElement.scrollTop;
    const shrinkOn = 30;
    const headerEl = document.querySelector('.sidebar');

    if (distanceY > shrinkOn) {
      headerEl?.classList.add("smaller");
    } else {
      headerEl?.classList.remove("smaller");
    }
  }

  const { grid, selection } = G;

  // Register scroll handler
  window.addEventListener('scroll', resizeHeaderOnScroll);

  // Victory message container
  let gameOverMsg: React.ReactNode = '';
  if (ctx.gameover) {
    gameOverMsg = (
      <div className="msg">
        <h2>You won!</h2>
        <p>You used { ctx.turn } turns.</p>
      </div>
    );
  }

  // Create the grid
  const gameTable: React.ReactNode[] = grid.reduce((acc1: React.ReactElement[], currentRow, rowIndex) => {
    let row = currentRow.reduce((acc2: React.ReactElement[], currentValue, cellIndex) => {
      const cellClasses = classNames({
        'is-selected': selection.some(sel =>
          isEqual([sel.row, sel.column], [rowIndex, cellIndex])
        ),
        'is-solved': currentValue === 0,
      });
      return acc2.concat(
        <td
          key={ cellIndex }
          className={ cellClasses }
          onClick={() => onCellClick(rowIndex, cellIndex)}
        >
          { currentValue }
        </td>
      );
    }, []);
    // Append dummy <td> until row is full
    while (row.length < 9) {
      row = row.concat(<td key={ row.length } className="dummy"></td>);
    }
    return acc1.concat(<tr key={ rowIndex }>{ row }</tr>);
  }, []);

  // Make Undo button disabled if nothing to undo
  // const undoButtonClassNames: string = classNames({
  //   'disabled': isEmpty(ctx.numMoves)
  // });

  return (
    <div className="wrap">
      <div className="sidebar column">
        <div className="controls">
          <h2>Controls</h2>
          <p className="turn-indicator">Turns: <strong>{ G.drawCounter }</strong></p>
          <div className="buttons">
            <button
              title="Append existing numbers to the grid"
              onClick={() => onDrawNewClick()}
            >
              Draw new set
            </button>
            <button
              title="Undo last move"
              onClick={() => onUndoClick()}
            >
              Undo
            </button>
            <button
              title="Show rules of the game"
              onClick={() => onHelpClick()}
            >
              Help
            </button>
            <button onClick={() => onResetClick()}>Reset game</button>
          </div>
        </div>
      </div>
      <div className="game-container column">
        <h1>Nmbrs</h1>
        <table className="game-board">
          <tbody>
            { gameTable }
          </tbody>
        </table>
        { gameOverMsg }
      </div>
    </div>
  )

}
