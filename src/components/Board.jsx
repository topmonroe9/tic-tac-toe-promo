import Cell from './Cell';

const Board = ({ board, onCellClick, winningLine, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-pink-100/50 to-lavender-100/50 rounded-3xl shadow-2xl backdrop-blur-sm">
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
