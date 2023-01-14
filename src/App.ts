import { Client } from 'boardgame.io/react';
import Nmbrs from './Game';
import Board from './Board';
import './App.css';

const App = Client({
  numPlayers: 1,
  game: Nmbrs,
  board: Board,
  debug: false,
});

export default App;
