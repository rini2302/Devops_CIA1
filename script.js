// Sudoku Game Implementation
class SudokuGame {
    constructor() {
        this.grid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        this.initialGrid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.timer = 0;
        this.timerInterval = null;
        this.difficulty = 'medium';
        
        this.init();
    }

    init() {
        this.renderGrid();
        this.attachEventListeners();
        this.startNewGame();
    }

    renderGrid() {
        const gridElement = document.getElementById('sudoku-grid');
        gridElement.innerHTML = '';
        
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = i;
            gridElement.appendChild(cell);
        }
    }

    attachEventListeners() {
        // Cell click events
        document.getElementById('sudoku-grid').addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.selectCell(e.target);
            }
        });

        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (this.selectedCell && !this.selectedCell.classList.contains('fixed')) {
                if (e.key >= '1' && e.key <= '9') {
                    this.setCellValue(this.selectedCell, e.key);
                } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                    this.setCellValue(this.selectedCell, '');
                }
            }
        });

        // Button events
        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
        document.getElementById('check-solution').addEventListener('click', () => this.checkSolution());
        document.getElementById('hint').addEventListener('click', () => this.giveHint());
        document.getElementById('clear').addEventListener('click', () => this.clearUserInputs());
        document.getElementById('reset').addEventListener('click', () => this.resetGame());
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.startNewGame();
        });
    }

    selectCell(cell) {
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }
        this.selectedCell = cell;
        cell.classList.add('selected');
    }

    setCellValue(cell, value) {
        const index = parseInt(cell.dataset.index);
        const row = Math.floor(index / 9);
        const col = index % 9;
        
        cell.textContent = value;
        this.grid[row][col] = value ? parseInt(value) : 0;
        
        if (value) {
            cell.classList.add('user-input');
            cell.classList.remove('error', 'correct', 'hint');
            
            // Validate input
            if (!this.isValidPlacement(row, col, parseInt(value))) {
                cell.classList.add('error');
            }
        } else {
            cell.classList.remove('user-input', 'error', 'correct', 'hint');
        }
    }

    startNewGame() {
        this.stopTimer();
        this.timer = 0;
        this.updateTimerDisplay();
        
        // Generate a new puzzle
        this.generatePuzzle();
        this.updateGridDisplay();
        this.showMessage('New game started! Good luck!', 'info');
        
        this.startTimer();
    }

    generatePuzzle() {
        // Generate a complete valid Sudoku solution
        this.solution = this.generateCompleteSudoku();
        
        // Copy solution to grid and initial grid
        this.grid = this.solution.map(row => [...row]);
        this.initialGrid = this.solution.map(row => [...row]);
        
        // Remove cells based on difficulty
        const cellsToRemove = this.getCellsToRemove();
        const positions = [];
        for (let i = 0; i < 81; i++) {
            positions.push(i);
        }
        
        // Shuffle positions
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        
        // Remove cells
        for (let i = 0; i < cellsToRemove; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / 9);
            const col = pos % 9;
            this.grid[row][col] = 0;
            this.initialGrid[row][col] = 0;
        }
    }

    getCellsToRemove() {
        switch (this.difficulty) {
            case 'easy': return 35;
            case 'medium': return 45;
            case 'hard': return 55;
            default: return 45;
        }
    }

    generateCompleteSudoku() {
        const grid = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fillSudoku(grid);
        return grid;
    }

    fillSudoku(grid, row = 0, col = 0) {
        if (row === 9) return true;
        if (col === 9) return this.fillSudoku(grid, row + 1, 0);
        
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        // Shuffle numbers
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        
        for (let num of numbers) {
            if (this.isValidPlacementInGrid(grid, row, col, num)) {
                grid[row][col] = num;
                if (this.fillSudoku(grid, row, col + 1)) {
                    return true;
                }
                grid[row][col] = 0;
            }
        }
        
        return false;
    }

    isValidPlacementInGrid(grid, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) return false;
        }
        
        // Check column
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) return false;
        }
        
        // Check 3x3 box
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[startRow + i][startCol + j] === num) return false;
            }
        }
        
        return true;
    }

    isValidPlacement(row, col, num) {
        return this.isValidPlacementInGrid(this.grid, row, col, num);
    }

    updateGridDisplay() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const value = this.grid[row][col];
            
            cell.textContent = value || '';
            cell.classList.remove('fixed', 'user-input', 'error', 'correct', 'hint', 'selected');
            
            if (this.initialGrid[row][col] !== 0) {
                cell.classList.add('fixed');
            }
        });
        
        this.selectedCell = null;
    }

    checkSolution() {
        let isComplete = true;
        let isCorrect = true;
        const cells = document.querySelectorAll('.cell');
        
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            
            if (this.grid[row][col] === 0) {
                isComplete = false;
            } else if (this.grid[row][col] !== this.solution[row][col]) {
                isCorrect = false;
                if (!cell.classList.contains('fixed')) {
                    cell.classList.add('error');
                    cell.classList.remove('correct');
                }
            } else {
                if (!cell.classList.contains('fixed')) {
                    cell.classList.add('correct');
                    cell.classList.remove('error');
                }
            }
        });
        
        if (!isComplete) {
            this.showMessage('Puzzle is not complete yet!', 'info');
        } else if (isCorrect) {
            this.stopTimer();
            this.showMessage('🎉 Congratulations! You solved the puzzle correctly!', 'success');
        } else {
            this.showMessage('Some cells are incorrect. Keep trying!', 'error');
        }
    }

    giveHint() {
        const emptyCells = [];
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0 || this.grid[i][j] !== this.solution[i][j]) {
                    if (this.initialGrid[i][j] === 0) {
                        emptyCells.push([i, j]);
                    }
                }
            }
        }
        
        if (emptyCells.length === 0) {
            this.showMessage('No hints available! Puzzle is complete or all filled cells are correct.', 'info');
            return;
        }
        
        const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const index = row * 9 + col;
        const cell = document.querySelectorAll('.cell')[index];
        
        this.grid[row][col] = this.solution[row][col];
        cell.textContent = this.solution[row][col];
        cell.classList.add('hint');
        cell.classList.remove('error', 'user-input');
        
        this.showMessage('Hint provided! Check the highlighted cell.', 'info');
    }

    clearUserInputs() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            
            if (this.initialGrid[row][col] === 0) {
                this.grid[row][col] = 0;
                cell.textContent = '';
                cell.classList.remove('user-input', 'error', 'correct', 'hint');
            }
        });
        
        this.showMessage('All user inputs cleared!', 'info');
    }

    resetGame() {
        this.grid = this.initialGrid.map(row => [...row]);
        this.updateGridDisplay();
        this.stopTimer();
        this.timer = 0;
        this.updateTimerDisplay();
        this.startTimer();
        this.showMessage('Game reset!', 'info');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    showMessage(message, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.className = 'message';
        }, 3000);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
