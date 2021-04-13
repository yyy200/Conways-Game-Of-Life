import React from 'react';
import './App.css';
import { Grid } from './grid';

function App() {
  return (
    <>
      <h1 style={{textAlign: "center"}}>Conway's Game of Life</h1>
      <Grid />
    </>
  )
}

export default App;
