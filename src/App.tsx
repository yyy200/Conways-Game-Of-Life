import produce from 'immer';
import React, { useCallback, useRef, useState } from 'react';
import './App.css';

const numRows = 50; //number of rows
const numCols = 50; //number of Columns
const runTime = 300; //MS period

function App() {
  const newEmptyGrid = ():number[][] => {
    return Array<Array<number>>(numCols).fill(Array<number>(numRows).fill(0))
  }

  const [grid, setGrid] = useState<number[][]>(newEmptyGrid())

  const [running, setRunning] = useState<boolean>(false)

  const onClickHandler =(i:number, j:number) => () => {
    const newGrid = produce(grid, gridCopy => {
      gridCopy[i][j] = grid[i][j] ? 0 : 1
      return gridCopy
    })
    setGrid(newGrid)
  }

  const transformations = [
    [0,1],
    [1,0],
    [-1,0],
    [0,-1],
    [1,1],
    [-1,-1],
    [-1,1],
    [1,-1]
  ]

  const runningRef = useRef(running)
  runningRef.current = running

  const runSim = useCallback( async () => {
    if(!runningRef.current){
      return
    }

    await setGrid( (g) => {
      return produce(g, gridcopy => {
        for(let i = 0; i < numCols; i ++) {
          for(let j = 0; j < numRows; j ++) {
            let neighbors = 0;
            transformations.forEach( ([x,y]) => {
              const newI = i + x
              const newJ = j + y

              if( newI >= 0 && newI < numCols && newJ >= 0 && newJ < numRows){
                neighbors += g[newI][newJ]
              }
            })

            if(grid[i][j] === 0 && neighbors === 3){
              gridcopy[i][j] = 1;
            }
            else if(neighbors > 3 || neighbors < 2){
              gridcopy[i][j] = 0;
            }
          }
        }
        return gridcopy
      })
    })
    
    setTimeout(runSim, runTime)
  }, [])


  const randomizer = ():number[][] => {
    let NewGrid = Array<Array<number>>(numCols).fill(Array<number>(numRows).fill(0))
    return NewGrid.map( row => row.map(_ => Math.random() > 0.6 ? 1 : 0))
    
  }

  return (
    <div className="main">
      <div className="btn-container">
        <button onClick={ () => {
          setRunning(prevrunning => { return !prevrunning })

          if(!running){
            runningRef.current = true
            runSim()
          }
          }}>
            { running ? 'Stop' : 'Start' }
          </button>

          <button onClick={() => { setGrid(randomizer()); setRunning(false)} }>
            Random Board
          </button>

          <button onClick={() => {setGrid(newEmptyGrid()); setRunning(false) }}>
            Clear Board
          </button>
      </div>

      <div className="grid" style={{ display:'grid', gridTemplateColumns: `repeat(${numCols}, 20px)`}}>
        { grid.map( (row, i) => {
          return  row.map( (col, j) => {
            return  (<div key={`${i}-${j}`} onClick={onClickHandler(i,j)} className={ `cell ${ col ? 'alive' : ""}` }></div>)
          }) 
        })
        }
      </div> 
    </div>
  );
}

export default App;
