import Cell from './Cell';

const Board = ({ board, onCellClick, winningLine, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 p-5 sm:p-7 glass-strong rounded-3xl shadow-2xl">
      {board.map((value, index) => (
        <Cell
          key={index}
          value={value}
          onClick={() => onCellClick(index)}
          isWinning={winningLine?.includes(index)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

export default Board;
