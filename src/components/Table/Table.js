import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

const getGrid = (width, height) => {
  let rows = [];

  for (let i = 0; i < height; i++) {
    let cells = [];
    for (let j = 0; j < width; j++)
      cells[j] = {
        key: uuidv4(),
        row: i,
        col: j,
        colSpan: 1,
        rowSpan: 1,
        parent: null,
      };

    rows[i] = cells;
  }

  return rows;
};

function updateSelection(from, to, grid) {
  const prevSelection = JSON.stringify({ from, to });

  for (let row = from.row; row <= to.row; row++) {
    for (let col = from.col; col <= to.col; col++) {
      to.col = Math.max(to.col, col + grid[row][col].colSpan - 1);
      to.row = Math.max(to.row, row + grid[row][col].rowSpan - 1);
      if (grid[row][col].parent) {
        from.col = Math.min(from.col, grid[row][col].parent.col);
        from.row = Math.min(from.row, grid[row][col].parent.row);
      }
    }
  }

  if (prevSelection !== JSON.stringify({ from, to })) {
    updateSelection(from, to, grid);
  }

  return { from, to };
}

const getSelection = (from, to, grid) => {
  const _from = {
    row: Math.min(from.row, to.row),
    col: Math.min(from.col, to.col),
  };

  const _to = {
    row: Math.max(from.row, to.row),
    col: Math.max(from.col, to.col),
  };

  return updateSelection(_from, _to, grid);
};

const Table = ({ width, height }) => {
  const isSelecting = useRef(false);
  const [grid, setGrid] = useState(getGrid(width, height));
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [selection, setSelection] = useState(null);



  const handleMouseDown = (e) => {
    if ("TD" === e.target.tagName) {
      let row = Number(e.target.dataset.rowIndex);
      let col = Number(e.target.dataset.colIndex);
      setFrom({ row, col });
      setTo({ row, col });
      isSelecting.current = true;
    }
  };

  useEffect(() => {
    const handleMouseUp = () => {
      isSelecting.current = false;
    };

    const handleMouseMove = (e) => {
      if ("TD" === e.target.tagName && isSelecting.current) {
        let row = Number(e.target.dataset.rowIndex);
        let col = Number(e.target.dataset.colIndex);
        setTo({ row, col });
      }
    };

    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (from && to) {
      setSelection(getSelection(from, to, grid));
    }
  }, [from, to]);

  const isSelect = (cell) => {
    if (selection) {
      const { from, to } = selection;
      if (cell.row >= from.row && cell.row <= to.row) {
        return cell.col >= from.col && cell.col <= to.col;
      }
    }
    return false;
  };

  const mergeCells = () => {
    const { from, to } = selection;
    const firstCell = grid[from.row][from.col];
    firstCell.colSpan = to.col - from.col + 1;
    firstCell.rowSpan = to.row - from.row + 1;
    for (let row = from.row; row <= to.row; row++) {
      for (let col = from.col; col <= to.col; col++) {
        if (firstCell !== grid[row][col]) {
          grid[row][col].parent = firstCell;
        }
      }
    }
    setGrid([...grid]);
  };

  const separateCells = () => {
    const { from, to } = selection;
    for (let row = from.row; row <= to.row; row++) {
      for (let col = from.col; col <= to.col; col++) {
        grid[row][col].parent = null;
        grid[row][col].colSpan = 1;
        grid[row][col].rowSpan = 1;
      }
    }
    setGrid([...grid]);
  };

  return (
    <>
      <div className="controls">
        <button disabled={!selection} data-merge-button onClick={mergeCells}>
          Merge
        </button>
        <button
          disabled={!selection}
          data-separate-button
          onClick={separateCells}
        >
          Separate
        </button>
      </div>
      <table onMouseDown={handleMouseDown}>
        <tbody>
          {grid.map((gridRow, rowIndex) => (
            <tr key={rowIndex}>
              {gridRow.map((gridCell) => {
                if (gridCell.parent) {
                  return null;
                }
                return (
                  <td
                    data-selected={isSelect(gridCell)}
                    data-row-index={gridCell.row}
                    data-col-index={gridCell.col}
                    key={gridCell.key}
                    colSpan={gridCell.colSpan}
                    rowSpan={gridCell.rowSpan}
                  >
                    row: {gridCell.row} col: {gridCell.col}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Table;
