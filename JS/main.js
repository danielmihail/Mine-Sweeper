'use strict'

var CELL = null;
var FLAG = '🚩';
var LIVE = '❤️';
var SHOW = 'SHOW';
var HIDE = 'HIDE';
var SMILE = '🙂';
var SAD = '😭';
var HAPPY = '🤗';
var gIcon;
var gSize = 12;
var gMines = 30;
var gFlagsCount = 30;
var gBoardClickable = true;
var HOWMANYLIVES = 3;
var gLives;

var gLevels = [
	{ id: 1, name: 'Easy', size: 4, mines: 3 },
	{ id: 2, name: 'Medium', size: 8, mines: 15 },
	{ id: 3, name: 'Hard', size: 12, mines: 30 }
]
var gBoard = buildBoard();
var gFirstClick = true;
var gTime;
var s = 0;
var m = 0;



function init() {
	gIcon = SMILE;
	clearInterval(gTime);
	renderClock();
	renderMinesCount();
	gLives = HOWMANYLIVES;
	adjustLives();
	document.querySelector('.clock').innerHTML = m + ': 0' + s; 
	renderBoard(gBoard);
	gBoardClickable = true;
	
}

function buildBoard() {
	var size = gSize;
	var board = new Array(size);
	for (var i = 0; i < board.length; i++) {
		board[i] = new Array(size);
	}

	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			var cell = {
				type: HIDE,
				gameElement: null,		
				mine: false,
				flag: false,
				location: { i: i, j: j }
			};
			board[i][j] = cell;
		}
	}
	return board;
}

function renderClock() {
	var strHTML = '';
	strHTML += '<div class="clock"></div>';
	var elBoard = document.querySelector('.clock-container');
	elBoard.innerHTML = strHTML;
}
function adjustLives() {
	var strHTML = '';
	var showLives = '';
	for (var i=0; i<gLives; i++) {
		showLives += LIVE;
	}
	strHTML += '<div class="gLives">' + showLives + '</div>';
	var elBoard = document.querySelector('.lives-container');
	elBoard.innerHTML = strHTML;
}

function renderMinesCount() {
	var strHTML = '';
	strHTML = '<div class="mines-count">' + gFlagsCount +'</div>';
	var elBoard = document.querySelector('.mines-container');
	elBoard.innerHTML = strHTML;
}

function renderBoard(board) {
	var strHTML = '';
	strHTML += '<th class="table-head" colspan="' + gSize + '">'
	// strHTML += '<div class="mines-count">' + gIcon + '</div></th>'
	strHTML += '<div class="gIcon">' + gIcon + '</div></th>'
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];
			var tdId = 'cell-' + i + '-' + j;
			var cellClass = '';
			if (currCell.type === SHOW) cellClass += 'shown';
			strHTML += '\t<td id="' + tdId + '" class="cell ' + cellClass + '" onmousedown="cellMarked(this, event)"'
			strHTML += ' onclick="cellClicked(this)">\n';

			if (currCell.type === SHOW) {
				if (currCell.mine === true) {
					strHTML += '💣';
				} else strHTML += '<img src="img/' + currCell.gameElement + '.png">';
			} else if (currCell.flag === true) strHTML += FLAG;
		}
		strHTML += '</tr>\n';
	}

	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}


function setFirstClick(i, j) {
	addCountOfspace(i, j);
	gTime = setInterval(startTime,1000);
	gFirstClick = false;
}

function expandShown(i, j) {
	var space = findspace(i, j);
	for (var k = 0; k < space.length; k++) {
		if (space[k].mine === false && space[k].type === HIDE) {
			if (space[k].gameElement !== 0) {
				space[k].type = SHOW;
			} else { 
				space[k].type = SHOW;
				expandShown(space[k].location.i, space[k].location.j);
			}
		}
	}
}

function cellClicked(elCell, event) {
	if (gBoardClickable) {
		var cellCoord = getCellCoord(elCell.id);
		var i = cellCoord.i;
		var j = cellCoord.j;
		if (gFirstClick) setFirstClick(i, j);
		if (gBoard[i][j].gameElement === 0) expandShown(i,j);
		if (gBoard[i][j].flag) return;
		else {
			gBoard[i][j].type = SHOW;
			if (gBoard[i][j].mine === true) {
				gLives--;
				adjustLives();
				if (gLives == 0) {
					gIcon = SAD;
					gBoardClickable = false;
					gameOver(true);
				} else {
					gFlagsCount--;
					renderMinesCount();
				}
				// alert(isVictory());
			}
			gameOver(isVictory());		
		}
		renderBoard(gBoard);
	}
}


function getCellCoord(strCellId) {
	var coord = {};
	coord.i = +strCellId.substring(5, strCellId.lastIndexOf('-'));
	coord.j = +strCellId.substring(strCellId.lastIndexOf('-') + 1);
	return coord;
}


function cellMarked(elCell, event) {
	var cellCoord = getCellCoord(elCell.id);
	var i = cellCoord.i;
	var j = cellCoord.j;

	if (event.button === 2) {
		if (gBoard[i][j].flag === false && gBoard[i][j].type === HIDE) {
			if (gFlagsCount > 0) {
				gBoard[i][j].flag = true;
				gFlagsCount--;
				renderMinesCount();
				isVictory();
				renderBoard(gBoard);
			}
			return;
		} if (gBoard[i][j].flag = true) {
			gBoard[i][j].flag = false;
			gFlagsCount++;
			renderMinesCount();
			renderBoard(gBoard);
		}
	}
}

function addCountOfspace(i, j) {	
	addMines(i, j);
	for (var m = 0; m < gBoard.length; m++) {
		for (var n = 0; n < gBoard[0].length; n++) {
			var mines = countspaceMine(findspace(m, n, gBoard));
			if (gBoard[m][n].mine === false) {
				gBoard[m][n].gameElement = mines;
			}
		}
	}
}

function addMines(i, j) {
	for (var count = 0; count < gMines;) {
		var mineLocation = getMineCoord(gBoard);
		var space = findspace(i, j);
		var isNeg = false;
		for (var k = 0; k < space.length; k++) {							
			if (space[k] === mineLocation) {
				var isNeg = true;
				break;
			}
		}
		if (!isNeg && mineLocation.mine === false) {				
			mineLocation.mine = true;
			count++;
			
		}
	}
}


function getMineCoord() {
	var i = getRandomInt(0, gSize - 1);
	var j = getRandomInt(0, gSize - 1);
	return gBoard[i][j];
}


function findspace(i, j) {
	var space = [];
	for (var m = -1; m < 2; m++) {
		if (gBoard[i + m] !== undefined) {
			for (var n = -1; n < 2; n++) {
				if (gBoard[i + m][j + n] !== undefined) {
					var neg = gBoard[i + m][j + n];
					space.push(neg);
				}
			}
		}
	}
	return space;
}


function countspaceMine(space) {
	var count = 0;
	for (var i = 0; i < space.length; i++) {
		if (space[i].mine) count++;
	}
	return count;
}


function gameOver(isTrue) {
	if (isTrue && isVictory() == false) {
		for (var i = 0; i < gBoard.length; i++) {
			for (var j = 0; j < gBoard[0].length; j++) {
				if (gBoard[i][j].mine === true) gBoard[i][j].type = SHOW;
			}
		}
		clearInterval(gTime);
		m = 0;
		s = 0;
        // alert('you lost!');
	}
}


function isVictory() {
	var countLivesLeft = HOWMANYLIVES;
	while (countLivesLeft > 0) {
		for (var i = 0; i < gBoard.length; i++) {
			for (var j = 0; j < gBoard[0].length; j++) {
				var cell = gBoard[i][j];
				if (cell.type === HIDE && cell.mine === false) {
					return false
				}
				if (cell.mine === true && cell.flag === false) {
					countLivesLeft--;
					if (countLivesLeft == 0)
						return false;
				}
			}
		}
		gIcon = HAPPY;
		clearInterval(gTime);
		// alert('you won!');
		return true;
	}

}


function startPlay() {
	clearInterval(gTime);
	gBoard = [];
	gBoard = buildBoard();
	gIcon = SMILE;
	gFlagsCount = gMines;
	gFirstClick = true;
	m = 0;
	s = 0;
	document.querySelector('.clock').innerHTML = m + ':' + s; 
	init();
}

function getLevel(elLevel) {					
	var id = +elLevel.id;
	for (var i = 0; i < gLevels.length; i++) {
		if (id === gLevels[i].id) {
			gSize = gLevels[i].size;
			gMines = gLevels[i].mines;
			gFlagsCount = gMines;
		}
	}
	startPlay();
}

function startTime() {
	s++;
	if (s === 60) {
		s = 0;
		m++;
	}
	if (s < 10) {			 
		s = "0" + s
	};
	document.querySelector('.clock').innerHTML = m + ':' + s; 
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

document.addEventListener('contextmenu', event => event.preventDefault()); 	