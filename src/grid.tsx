import produce from 'immer';
import React, { BaseSyntheticEvent, useCallback, useRef, useState } from 'react';

interface Props {
}

export const Grid: React.FC<Props> = () => {
  const smallScreen:boolean = window.matchMedia("(max-width: 663px)").matches

  const [numRows, setRows] = useState(smallScreen ? 15 : 30)
  const [numCols, setCols] = useState(smallScreen ? 15 : 30)
  
  const rowsRef = useRef(numRows)
  const colsRef = useRef(numRows)

  rowsRef.current = numRows
  colsRef.current = numCols

  const newEmptyGrid = ():number[][] => Array<Array<number>>(colsRef.current).fill(Array<number>(rowsRef.current).fill(0))
  
  const [grid, setGrid] = useState<number[][]>(newEmptyGrid())
    
  const [running, setRunning] = useState<boolean>(false)

  const [runTime, setRunTime]  = useState<number>(300)
  const runTimeRef = useRef(runTime)
  runTimeRef.current = runTime

  const onClickHandler = (i:number, j:number) => () => {
    setRunning(false)

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
        
        setTimeout(runSim, runTimeRef.current)
      }, [])


      const handleRangeChange = (e: BaseSyntheticEvent) => {
        const value = Number(e.target.value)

        switch(e.target.name){
          case "sizer-x":
            setCols(value)
            colsRef.current = value
            break;
          case "sizer-y":
            setRows(value)
            rowsRef.current = value
            break;
        }

        setGrid(newEmptyGrid())
      }
    
    
      const randomizer = ():number[][] => {
        let NewGrid = Array<Array<number>>(colsRef.current).fill(Array<number>(rowsRef.current).fill(0))
        return NewGrid.map( row => row.map(_ => Math.random() > 0.6 ? 1 : 0))
        
      }

      const handleSpeedChange = (e: BaseSyntheticEvent) => { 
        const value =  Number(Math.abs(e.target.value)); 
        runTimeRef.current = value; 
        setRunTime(value); 
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
    
              <button onClick={() => {setGrid(randomizer()); setRunning(false)}}>
                Random Board
              </button>
    
              <button onClick={() => {setGrid(newEmptyGrid()); setRunning(false)}}>
                Clear Board
              </button>

              <div>
                <label htmlFor={'sizer'}><b>Grid Sizer:</b> ({numRows} x {numCols})</label>
                <br />
                <label>Rows: </label>
                <input name="sizer-y" type="range" max={smallScreen ? 25 : 33} min={5} onInput={(e) => handleRangeChange(e)} value={rowsRef.current}/>
                <br />
                <label>Columns: </label>
                <input name="sizer-x" type="range" max={smallScreen ? 15 : 55} min={5}  onInput={(e) => handleRangeChange(e)} value={colsRef.current}/>
              </div>
              <div>
                <label htmlFor="timer"><b>Speed:</b></label>
                <br />
                <input name="timer" type="range" max={-200} min={-1000} value={runTimeRef.current} onInput={(e) => handleSpeedChange(e)} />
              </div>
          </div>
    
          <div className="grid" style={{ display:'grid', gridTemplateColumns: `repeat(${colsRef.current}, 20px)`, gridTemplateRows: `repeat(${rowsRef.current}, 20px)`}}>
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