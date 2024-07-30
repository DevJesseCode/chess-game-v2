const pieceMap = {
	r: "rook",
	h: "knight",
	b: "bishop",
	k: "king",
	q: "queen",
	p: "pawn"
}

const checkSquares = [
	[ -1, -1 ],
	[ -1, 0 ],
	[ -1, 1 ],
	[ 0, -1 ],
	[ 0, 1 ],
	[ 1, -1 ],
	[ 1, 0 ],
	[ 1, 1 ],
]

const knightSquares = [
	[ -1, -2 ],
	[ -1, 2 ],
	[ 1, -2 ],
	[ 1, 2 ],
	[ -2, -1 ],
	[ -2, 1 ],
	[ 2, -1 ],
	[ 2, 1 ],
]

const verify = {
	king(board, fx, fy, tx, ty) {
		// Calculate the absolute differences in rows and columns
		const rowDiff = Math.abs(fy - ty);
		const colDiff = Math.abs(fx - tx);

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
			board[ty][tx] = board[fy][fx]
			board[fy][fx] = ""
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
			board[ty][tx] = board[fy][fx]
			board[fy][fx] = ""
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
			board[ty][tx] = board[fy][fx]
			board[fy][fx] = ""
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
			board[ty][tx] = board[fy][fx]
			board[fy][fx] = ""
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
				if (currentRow < 0 || currentRow > 7 || currentCol < 0 || currentCol > 7) return { board: board, valid: false };
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
			board[ty][tx] = board[fy][fx]
			board[fy][fx] = ""
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
			if (board[ty][tx].startsWith("b")) return { board: board, valid: false }
			if (
				rowDiff === -1 && // Move one row forward
				colDiff === 0 && // Stay in the same column
				!board[ty][tx] // Square is empty
			) {
				// Valid move for a black pawn
				board[ty][tx] = board[fy][fx]
				board[fy][fx] = ""
				return { board: board, valid: true };
			} else if (
				rowDiff === -2 && // Move two rows forward
				colDiff === 0 && // Stay in the same column
				fy === 1 && // Only on the initial two-square move
				!board[ty][tx] // Square is empty
			) {
				// Valid move for a black pawn (initial two-square move)
				board[ty][tx] = board[fy][fx]
				board[fy][fx] = ""
				return { board: board, valid: true };
			} else if (
				rowDiff === -1 && // Move one row forward
				colDiff === 1 && // Move diagonally (right)
				board[ty][tx] && // Capture an opponent's piece
				!board[ty][tx].startsWith("b") // Opponent's piece is white
			) {
				// Valid move for a black pawn (capture diagonally right)
				board[ty][tx] = board[fy][fx]
				board[fy][fx] = ""
				return { board: board, valid: true };
			} else if (
				rowDiff === -1 && // Move one row forward
				colDiff === -1 && // Move diagonally (left)
				board[ty][tx] && // Capture an opponent's piece
				!board[ty][tx].startsWith("b") // Opponent's piece is white
			) {
				// Valid move for a black pawn (capture diagonally left)
				board[ty][tx] = board[fy][fx]
				board[fy][fx] = ""
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
			if (board[ty][tx].startsWith("w")) return { board: board, valid: false }
			if (
				rowDiff === 1 && // Move one row forward
				colDiff === 0 && // Stay in the same column
				!board[ty][tx] // Square is empty
			) {
				// Valid move for a white pawn
				board[ty][tx] = board[fy][fx]
				board[fy][fx] = ""
				return { board: board, valid: true };
			} else if (
				rowDiff === 2 && // Move two rows forward
				colDiff === 0 && // Stay in the same column
				fy === 6 && // Only on the initial two-square move
				!board[ty][tx] // Square is empty
			) {
				// Valid move for a white pawn (initial two-square move)
				board[ty][tx] = board[fy][fx]
				board[fy][fx] = ""
				return { board: board, valid: true };
			} else if (
				rowDiff === 1 && // Move one row forward
				colDiff === 1 && // Move diagonally (right)
				board[ty][tx] && // Capture an opponent's piece
				board[ty][tx].startsWith("b") // Opponent's piece is black
			) {
				// Valid move for a white pawn (capture diagonally right)
				board[ty][tx] = board[fy][fx]
				board[fy][fx] = ""
				return { board: board, valid: true };
			} else if (
				rowDiff === 1 && // Move one row forward
				colDiff === -1 && // Move diagonally (left)
				board[ty][tx] && // Capture an opponent's piece
				board[ty][tx].startsWith("b") // Opponent's piece is black
			) {
				// Valid move for a white pawn (capture diagonally left)
				board[ty][tx] = board[fy][fx]
				board[fy][fx] = ""
				return { board: board, valid: true };
			} else if (
				rowDiff === 1 && // Move one row forward
				colDiff === 1 && // Move diagonally (left)
				!board[ty][tx] && // En passant capture
				fy === 3 && // Only on the correct row for en passant
				board[fy][fx - 1] && // Opponent's pawn
				board[fy][fx - 1].startsWith("b") // Opponent's pawn is black
			) {
				// Valid move for a white pawn (en passant capture)
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
				// Valid move for a white pawn (en passant capture)
				board[fy][fx + 1] = "";
				return { board: board, special: { enpassant: [ fy, fx + 1 ] }, valid: true };
			} else {
				// Invalid move for a white pawn
				return { board: board, valid: false };
			}
		}
	},
}

function inCheck(board, kCamp) {
	const checkData = {
		white: { pos: null, check: false, attacker: null },
		black: { pos: null, check: false, attacker: null },
	};
	
	const temp = _getKingPositions(board);
	checkData.white.pos = { row: temp.white.row, col: temp.white.col };
	checkData.black.pos = { row: temp.black.row, col: temp.black.col };

	const checkSquaresAroundKing = (camp) => {
		const enemy = camp === "white" ? "b" : "w";
		const diagonals = ["b", "q"].map(piece => enemy + piece);
		const horizontals = ["q", "r"].map(piece => enemy + piece);
		const kingRow = checkData[camp].pos.row;
		const kingCol = checkData[camp].pos.col;
		const checkSquares = [
			[-1, -1], [-1, 0], [-1, 1],
			[0, -1], [0, 1],
			[1, -1], [1, 0], [1, 1]
		];
		const knightSquares = [
			[-2, -1], [-1, -2], [1, -2], [2, -1],
			[-2, 1], [-1, 2], [1, 2], [2, 1]
		];

		// Check for diagonal and straight-line threats (bishops, rooks, queens)
		for (const [dx, dy] of checkSquares) {
			let row = kingRow + dx;
			let col = kingCol + dy;
			while (row >= 0 && row < 8 && col >= 0 && col < 8) {
				const piece = board[row][col];
				if (piece) {
					if (dx && dy) { // Diagonal
						if (diagonals.includes(piece) ||
							(camp === "white" && piece === "bp" && dx === -1) ||
							(camp === "black" && piece === "wp" && dx === 1)) {
							checkData[camp].check = true;
							checkData[camp].attacker = { row, col };
						}
					} else { // Horizontal or vertical
						if (horizontals.includes(piece)) {
							checkData[camp].check = true;
							checkData[camp].attacker = { row, col };
						}
					}
					break;
				}
				row += dx;
				col += dy;
			}
		}

		// Check for knight threats
		for (const [dx, dy] of knightSquares) {
			const row = kingRow + dx;
			const col = kingCol + dy;
			if (row >= 0 && row < 8 && col >= 0 && col < 8) {
				const piece = board[row][col];
				if (piece === enemy + "h") {
					checkData[camp].check = true;
					checkData[camp].attacker = { row, col };
				}
			}
		}
	};

	checkSquaresAroundKing("white");
	checkSquaresAroundKing("black");

	return kCamp ? checkData[kCamp] : checkData;
}

function testCheckmate(board) {
	const king_pos = _getKingPositions(board)
	const data = { return: { white: null, black: null }, completed: [0, 0], check: inCheck(board) }
	let tempBoard

	console.log("King is in check?")
	if (!data.check.white.check) {
		data.return.white = false
		data.completed[0] = 1
	}
	if (!data.check.black.check) {
		data.return.black = false
		data.completed[1] = 1
	}
	console.log(`white: ${data.return.white === null ? true : false}\nblack: ${data.return.black === null ? true : false}`)
	if (data.completed[0] && data.completed[1]) return data.return

	console.log("King can escape check?")
	for (const [ row, col ] of checkSquares) {
		const skip = {}
		let tempRow, tempCol, check
		tempBoard = structuredClone(board)

		tempRow = king_pos.white.row + row
		tempCol = king_pos.white.col + col
		if (tempBoard[tempRow]?.[tempCol].startsWith("w")) {
			king_pos.white.check = {
				row: king_pos.white.row,
				col: king_pos.white.col
			}
		} else {
			king_pos.white.check = {
				row: tempRow,
				col: tempCol,
			}
		}

		tempRow = king_pos.black.row + row
		tempCol = king_pos.black.col + col
		if (tempBoard[tempRow]?.[tempCol].startsWith("b")) {
			king_pos.black.check = {
				row: king_pos.black.row,
				col: king_pos.black.col
			}
		} else {
			king_pos.black.check = {
				row: tempRow,
				col: tempCol,
			}
		}

		if (king_pos.white.check.row < 0 || king_pos.white.check.row > 7 || king_pos.white.check.col < 0 || king_pos.white.check.col > 7 || (king_pos.white.check.row === king_pos.white.row && king_pos.white.check.col === king_pos.white.col)) skip.white = true
		if (king_pos.black.check.row < 0 || king_pos.black.check.row > 7 || king_pos.black.check.col < 0 || king_pos.black.check.col > 7 || (king_pos.black.check.row === king_pos.black.row && king_pos.black.check.col === king_pos.black.col)) skip.black = true

		if (skip.white && skip.black) continue

		!skip.white && (tempBoard[king_pos.white.check.row][king_pos.white.check.col] = "wk")
		!skip.white && (tempBoard[king_pos.white.row][king_pos.white.col] = "")
		!skip.black && (tempBoard[king_pos.black.check.row][king_pos.black.check.col] = "bk")
		!skip.black && (tempBoard[king_pos.black.row][king_pos.black.col] = "")
		check = inCheck(tempBoard)

		if (!check.white.check && !skip.white) {
			data.return.white = data.return.white === null ? false : data.return.white
			data.completed[0] = 1
		}
		if (!check.black.check && !skip.black) {
			data.return.black = data.return.black === null ? false : data.return.black
			data.completed[1] = 1
		}
	}
	
	console.log(`white: ${data.return.white}\nblack: ${data.return.black}`)
	if (data.completed[0] && data.completed[1]) return data.return

	console.log("Attack can be stopped?")
	function attackerCanBeBlockedOrKilled(camp) {
		const possible_moves_map = _getAllPiecesPossibleMoves(board)
		const pathToAttacker = _getPathToPiece(
			king_pos[camp].row,
			king_pos[camp].col,
			data.check[camp].attacker.row,
			data.check[camp].attacker.col
		)

		if (!pathToAttacker.length) return false

		for (const pos of pathToAttacker) {
			const possibleAttackers = []
			for (const piece_arr of possible_moves_map[pos.join("")]) {
				piece_arr[0][0] === camp[0] ? possibleAttackers.push(possible_moves_map.references[piece_arr[1]]) : undefined
			}
			if (!possibleAttackers.length) continue

			for (const attacker of possibleAttackers) {
				tempBoard = structuredClone(board)
				if (tempBoard[attacker.r][attacker.c].endsWith("k")) continue
				tempBoard[attacker.r][attacker.c] = ""

				if (!inCheck(tempBoard, camp).check) return true
			}
		}

		return false
	}

	data.return.white = data.return.white === null ? !attackerCanBeBlockedOrKilled("white") : data.return.white
	data.return.black = data.return.black === null ? !attackerCanBeBlockedOrKilled("black") : data.return.black
	data.completed[0] = 1
	data.completed[1] = 1

	console.log(`white: ${data.return.white === null ? true : false}\nblack: ${data.return.black === null ? true : false}`)
	return data.return
}

function _getAllPiecesPossibleMoves(board) {
	const move_squares = { references: {} }
	for (let r = 0; r < 8; r++) {
		for (let c = 0; c < 8; c++) {
			if (board[r][c]) {
				const ref = _genRandomString(4)
				for (let cr = 0; cr < 8; cr++) {
					for (let cc = 0; cc < 8; cc++) {
						if (verify[pieceMap[board[r][c][1]]](structuredClone(board), c, r, cc, cr).valid) {
							move_squares.references[ref] = { r, c }
							if (!move_squares[`${cr}${cc}`]) move_squares[`${cr}${cc}`] = []
							move_squares[`${cr}${cc}`].push([board[r][c], ref])
						}
					}
				}
			}
		}
	}
	return move_squares
}

function _getKingPositions(board) {
	const positions = {
		white: null,
		black: null,
	}
	for (let i = 0; i < 64; i++) {
		const row = Math.floor(i / 8)
		const col = i % 8
		const piece = board[row][col]
		if (piece === "wk") positions.white = { row, col }
		if (piece === "bk") positions.black = { row, col }
		if (positions.white && positions.black) break
	}
	return positions
}

function _getPathToPiece(fr, fc, tr, tc) {
	const path = []
	let rowIncrement = (tr - fr) && (tr > fr ? 1 : -1)
	let colIncrement = (tc - fc) && (tc > fc ? 1 : -1)

	if (!(rowIncrement || colIncrement)) return path

	let r = fr + rowIncrement, c = fc + colIncrement
	while ((r > -1 && r !== tr + rowIncrement && c > -1 && c !== tc + colIncrement && r < 8 && c < 8)) {
		path.push([ r, c ])
		r += rowIncrement
		c += colIncrement
	}

	return path
}

function _genRandomString(length) {
	const string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890#$%&*()^-=+.?"
	let id = ""
	for (let i = 0; i < length; i++) {
		id += string[Number((Math.random() * (string.length - 1)).toFixed(0))]
	}
	return id
}

module.exports = {
	pieceMap,
	checkSquares,
	knightSquares,
	verify,
	inCheck,
	testCheckmate,
	_getKingPositions,
	_getAllPiecesPossibleMoves,
	_getPathToPiece,
	_genRandomString
}