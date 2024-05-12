const verify = {
	king(board, fx, fy, tx, ty) {
		// Calculate the absolute differences in rows and columns
		const rowDiff = Math.abs(fy - ty);
		const colDiff = Math.abs(fx - fy);

		// Check if the move is valid for a king (within a single square)
		if (rowDiff <= 1 && colDiff <= 1) {
			// Check if will kill own piece
			if (
				(board[fy][fx].startsWith("w") && board[ty][tx].startsWith("w")) ||
				(board[fy][fx].startsWith("b") && board[ty][tx].startsWith("b"))
			) {
				// Will kill own piece
				return { board: board, valid: false };
			}
			// The move is valid for a king
			return { board: board, valid: true };
		} else {
			// The move is not valid for a king
			return { board: board, valid: false };
		}
	},
	queen(board, fx, fy, tx, ty) {
		// Check if the move is along a row, column, or diagonal
		if (fy === ty || fx === tx || Math.abs(fy - ty) === Math.abs(fx - tx)) {
			// Determine the direction of movement
			const rowIncrement = fy === ty ? 0 : fy < ty ? 1 : -1;
			const colIncrement = fx === tx ? 0 : fx < tx ? 1 : -1;

			let currentRow = fy + rowIncrement;
			let currentCol = fx + colIncrement;

			while (currentRow !== ty || currentCol !== tx) {
				const currentSquare = board[currentRow][currentCol];

				// Check if there is a piece in the current square
				if (currentSquare) {
					// There is a piece in the way
					return { board: board, valid: false };
				}

				currentRow += rowIncrement;
				currentCol += colIncrement;
			}

			if (
				board[ty][tx] &&
				board[currentRow][currentCol].startsWith(board[fy][fx].startsWith("w") ? "w" : "b")
			) {
				// Will kill own piece
				return { board: board, valid: false };
			}
			// The move is valid (no piece in the way)
			return { board: board, valid: true };
		} else {
			// The move is not along a row, column, or diagonal
			return { board: board, valid: false };
		}
	},
	rook(board, fx, fy, tx, ty) {
		// Check if the move is along a row or column
		if (fy === ty || fx === tx) {
			// Determine the direction of movement
			const rowIncrement = fy === ty ? 0 : fy < ty ? 1 : -1;
			const colIncrement = fx === tx ? 0 : fx < tx ? 1 : -1;

			let currentRow = fy + rowIncrement;
			let currentCol = fx + colIncrement;

			while (currentRow !== ty || currentCol !== tx) {
				const currentSquare = board[currentRow][currentCol];

				// Check if there is a piece in the current square
				if (currentSquare) {
					// There is a piece in the way
					return { board: board, valid: false };
				}

				currentRow += rowIncrement;
				currentCol += colIncrement;
			}

			// Check if will kill own piece
			if (
				board[ty][tx] &&
				board[ty][tx].startsWith(board[fy][fx].startsWith("w") ? "w" : "b")
			) {
				// Element child of moveSquare is own piece
				return { board: board, valid: false };
			}

			// The move is valid (there is no piece in the way)
			return { board: board, valid: true };
		} else {
			// The move is not along a row or column
			return { board: board, valid: false };
		}
	},
	knight(board, fx, fy, tx, ty) {
		// Calculate the absolute differences in rows and columns
		const rowDiff = Math.abs(fy - ty);
		const colDiff = Math.abs(fx - tx);

		// Check if the move is valid for a knight
		if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
			// Check if will kill own piece
			if (
				board[ty][tx] &&
				board[ty][tx].startsWith(board[fy][fx].startsWith("w") ? "w" : "b")
			) {
				// Element child of moveSquare is own piece
				return { board: board, valid: false };
			}

			// The move is valid for a knight
			return { board: board, valid: true };
		} else {
			// The move is not valid for a knight
			return { board: board, valid: false };
		}
	},
	bishop(board, fx, fy, tx, ty) {
		// Calculate the row and column differences between the squares
		const rowDiff = ty - fy;
		const colDiff = tx - fx;

		// Validate the move
		if (Math.abs(rowDiff) === Math.abs(colDiff)) {
			// The move is along a diagonal

			const rowIncrement = rowDiff > 0 ? 1 : -1; // Determine the row increment direction
			const colIncrement = colDiff > 0 ? 1 : -1; // Determine the column increment direction

			let currentRow = fy + rowIncrement;
			let currentCol = fx + colIncrement;

			while (
				currentRow !== ty &&
				currentCol !== tx
			) {
				const currentSquare = board[currentRow][currentCol];

				// Check if there is a piece in the current square
				if (currentSquare) {
					// There is a piece in the way
					return { board: board, valid: false };
				}

				currentRow += rowIncrement;
				currentCol += colIncrement;
			}

			// Check if will kill own piece
			if (
				board[ty][tx] &&
				board[ty][tx].startsWith(board[fy][fx].startsWith("w") ? "w" : "b")
			) {
				// Element child of moveSquare is own piece
				return { board: board, valid: false };
			}

			// The move is valid (no piece in the way)
			return { board: board, valid: true };
		} else {
			// The move is not along a diagonal
			return { board: board, valid: false };
		}
	},
	pawn(board, fx, fy, tx, ty) {
		// Calculate the row and column differences between the squares
		const rowDiff = fy - ty;
		const colDiff = fx - tx;

		// Validate the move
		if (board[fy][fx].startsWith("b")) {
			// Black pawn
			if (
				rowDiff === -1 && // Move one row forward
				colDiff === 0 // Stay in the same column
			) {
				// Valid move for a black pawn
				return { board: board, valid: true };
			} else if (
				rowDiff === -2 && // Move two rows forward
				colDiff === 0 && // Stay in the same column
				fy === 1 // Only on the initial two-square move
			) {
				// Valid move for a black pawn (initial two-square move)
				return { board: board, valid: true };
			} else if (
				rowDiff === -1 && // Move one row forward
				colDiff === 1 && // Move diagonally (right)
				board[ty][tx] && // Capture an opponent's piece
				!board[ty][tx].startsWith("b") // Opponent's piece is white
			) {
				// Valid move for a black pawn (capture diagonally right)
				return { board: board, valid: true };
			} else if (
				rowDiff === -1 && // Move one row forward
				colDiff === -1 && // Move diagonally (left)
				board[ty][tx] && // Capture an opponent's piece
				!board[ty][tx].startsWith("b") // Opponent's piece is white
			) {
				// Valid move for a black pawn (capture diagonally left)
				return { board: board, valid: true };
			} else if (
				rowDiff === -1 && // Move one row forward
				colDiff === -1 && // Move diagonally (right)
				!board[ty][tx] && // En passant capture
				fy === 4 && // Only on the correct row for en passant
				board[fy][fx + 1] && // Opponent's pawn
				!board[fy][fx + 1].startsWith("b") // Opponent's pawn is white
			) {
				// Valid move for a black pawn (en passant capture)
				board[fy][fx + 1] = "";
				return { board: board, special: { enpassant: [ fy, fx + 1 ] }, valid: true };
			} else if (
				rowDiff === -1 && // Move one row forward
				colDiff === 1 && // Move diagonally (left)
				!board[ty][tx] && // En passant capture
				fy === 4 && // Only on the correct row for en passant
				board[fy][fx - 1] && // Opponent's pawn
				!board[fy][fx - 1].startsWith("b") // Opponent's pawn is white
			) {
				// Valid move for a black pawn (en passant capture)
				board[fy][fx - 1] = "";
				return { board: board, special: { enpassant: [ fy, fx - 1 ] }, valid: true };
			} else {
				// Invalid move for a black pawn
				return { board: board, valid: false };
			}
		} else {
			// White pawn
			if (
				rowDiff === 1 && // Move one row forward
				colDiff === 0 // Stay in the same column
			) {
				// Valid move for a white pawn
				return { board: board, valid: true };
			} else if (
				rowDiff === 2 && // Move two rows forward
				colDiff === 0 && // Stay in the same column
				fy === 6 // Only on the initial two-square move
			) {
				// Valid move for a white pawn (initial two-square move)
				return { board: board, valid: true };
			} else if (
				rowDiff === 1 && // Move one row forward
				colDiff === 1 && // Move diagonally (right)
				board[ty][tx] && // Capture an opponent's piece
				board[ty][tx].startsWith("b") // Opponent's piece is black
			) {
				// Valid move for a white pawn (capture diagonally right)
				return { board: board, valid: true };
			} else if (
				rowDiff === 1 && // Move one row forward
				colDiff === -1 && // Move diagonally (left)
				board[ty][tx] && // Capture an opponent's piece
				board[ty][tx].startsWith("b") // Opponent's piece is black
			) {
				// Valid move for a white pawn (capture diagonally left)
				return { board: board, valid: true };
			} else if (
				rowDiff === 1 && // Move one row forward
				colDiff === 1 && // Move diagonally (left)
				!board[ty][tx] && // En passant capture
				fy === 3 && // Only on the correct row for en passant
				board[fy][fx - 1] && // Opponent's pawn
				board[fy][fx - 1].startsWith("b") // Opponent's pawn is black
			) {
				// Valid move for a black pawn (en passant capture)
				board[fy][fx - 1] = "";
				return { board: board, special: { enpassant: [ fy, fx - 1 ] }, valid: true };
			} else if (
				rowDiff === 1 && // Move one row forward
				colDiff === -1 && // Move diagonally (left)
				!board[ty][tx] && // En passant capture
				fy === 3 && // Only on the correct row for en passant
				board[fy][fx + 1] && // Opponent's pawn
				board[fy][fx + 1].startsWith("b") // Opponent's pawn is black
			) {
				// Valid move for a black pawn (en passant capture)
				board[fy][fx + 1] = "";
				return { board: board, special: { enpassant: [ fy, fx + 1 ] }, valid: true };
			} else {
				// Invalid move for a white pawn
				return { board: board, valid: false };
			}
		}
	},
}
module.exports = verify