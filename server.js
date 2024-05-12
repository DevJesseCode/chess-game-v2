const http = require("http")
const fs = require("fs").promises
const path = require("path")
const verify = require("./dependencies/verify.js")
const port = process.argv[3] || process.env.PORT || 8080
const wd = path.join(process.cwd(), process.argv[2] || "")
const mimeMap = {
	".css": "text/css",
	".gif": "image/gif",
	".html": "text/html",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".js": "text/javascript",
	".json": "application/json",
	".png": "image/png",
	".svg": "image/svg+xml"
}
const pieceMap = {
	r: "rook",
	h: "knight",
	b: "bishop",
	k: "king",
	q: "queen",
	p: "pawn"
}
const requestListener = function (req, res) {
	console.log(req.socket.remoteAddress)
	let ext = ""
	req.url === "/" && (req.url = "/index.html")
	ext = path.extname(req.url)
	if (req.url.startsWith("/verify")) {
		const options = {}
		const optionsArr = req.url.split("?")[1].split("&").map(opt => opt.split("="))
		for (let i = 0; i < optionsArr.length; i++) {
			options[optionsArr[i][0]] = JSON.parse(decodeURI(optionsArr[i][1]))
		}
		const { board, fx, fy, tx, ty } = options
		const moveData = verify[pieceMap[options.board[fy][fx][1]]](board, fx, fy, tx, ty)
		let response = {}
		res.setHeader("Content-Type", "application/json")
		res.writeHead(200)
		if (moveData.valid) {
			response = {
				piece: {
					camp: options.board[fy][fx][0] === "w" ? "white" : "black",
					type: pieceMap[options.board[fy][fx][1]]
				},
				move: {
					from: { row: fy, col: fx, pos: [ fy, fx ] },
					to: { row: ty, col: tx, pos: [ ty, tx ] }
				},
				boardState: {
					old: board,
					new: moveData.board
				},
				special: moveData.special || {},
				valid: true
			}
			res.end(JSON.stringify(response))
		} else {
			response = {
				piece: {
					camp: options.board[fy][fx][0] === "w" ? "white" : "black",
					type: pieceMap[options.board[fy][fx][1]]
				},
				move: {
					from: { row: fy, col: fx, pos: [ fy, fx ] },
					to: { row: ty, col: tx, pos: [ ty, tx ] }
				},
				boardState: {
					old: board,
					new: moveData.board
				},
				special: moveData.special || {},
				valid: false
			}
			res.end(JSON.stringify(response))
		}
		return true
	}
	console.log(`Started loading ${req.url} (${mimeMap[ext]})`)
	fs.readFile(path.join(wd, req.url))
		.then(contents => {
			mimeMap[ext] && res.setHeader("Content-Type", mimeMap[ext])
			res.writeHead(200)
			res.end(contents)
			console.log("Successfully loaded " + req.url)
		})
		.catch(err => {
			console.error("Error reading file:", err)
			if (err.code === 'ENOENT') {
				res.writeHead(404)
				res.end("The file requested was not found on the server")
			} else {
				res.writeHead(500)
				res.end("An error occurred. Please try again later.")
			}
		})
}
const server = http.createServer(requestListener)

server.listen(port, () => {
	console.log("Server is running")
	console.log(`Location: ${wd}`)
	console.log(`Address: 127.0.0.1:${port}\n`)
})