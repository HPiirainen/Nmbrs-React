import React from 'react';
import { isEmpty, isEqual } from 'lodash';
import classNames from 'classnames';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import exampleImage from './example.png';
import githubLogo from './GitHub-Mark.png';
import './Board.css';

class NmbrsBoard extends React.Component {

  // Click handlers
  onCellClick = (row, column) => {
    const { moves } = this.props;
    moves.selectCell(row, column);
  }

  onDrawNewClick = () => {
    const { moves, events } = this.props;
    moves.drawNewSet();
    events.endTurn();
  }

  onUndoClick = () => {
    const { undo } = this.props;
    undo();
  }

  onResetClick = () => {
    const { reset } = this.props;
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

  onHelpClick = () => {
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
            <div class="react-confirm-alert-button-group">
              <button onClick={ onClose }>Close</button>
            </div>
          </div>
        )
      }
    });
  }

  // Scroll event handler for resizing header
  resizeHeaderOnScroll = () => {
    const distanceY = window.pageYOffset || document.documentElement.scrollTop;
    const shrinkOn = 30;
    const headerEl = document.querySelector('.sidebar');

    if (distanceY > shrinkOn) {
      headerEl.classList.add("smaller");
    } else {
      headerEl.classList.remove("smaller");
    }
  }

  render() {
    const { G: { grid, selection }, ctx } = this.props;

    // Register scroll handler
    window.addEventListener('scroll', this.resizeHeaderOnScroll);

    // Victory message container
    let gameOverMsg = '';
    if (ctx.gameover) {
      gameOverMsg = (
        <div className="msg">
          <h2>You won!</h2>
          <p>You used { ctx.turn } turns.</p>
        </div>
      );
    }

    // Create the grid
    const gameTable = grid.reduce((acc1, currentRow, rowIndex) => {
      let row = currentRow.reduce((acc2, currentValue, cellIndex) => {
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
            onClick={() => this.onCellClick(rowIndex, cellIndex)}
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
    const undoButtonClassNames = classNames({
      'disabled': isEmpty(ctx.stats.turn.numMoves)
    });

    return (
      <div className="wrap">
        <div className="sidebar column">
          <div className="controls">
            <h2>Controls</h2>
            <p className="turn-indicator">Turns: <strong>{ ctx.turn }</strong></p>
            <div className="buttons">
              <button
                title="Append existing numbers to the grid"
                onClick={() => this.onDrawNewClick()}
              >
                Draw new set
              </button>
              <button
                title="Undo last move"
                className={ undoButtonClassNames }
                onClick={() => this.onUndoClick()}
              >
                Undo
              </button>
              <button
                title="Show rules of the game"
                onClick={() => this.onHelpClick()}
              >
                Help
              </button>
              <button onClick={() => this.onResetClick()}>Reset game</button>
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

}

export default NmbrsBoard;
