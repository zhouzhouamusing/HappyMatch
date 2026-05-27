import { ref, computed } from 'vue'

const ROWS = 8
const COLS = 8
const FRUITS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐']

const LEVELS = [
  { level: 1, target: 500, moves: 20, description: '入门关卡' },
  { level: 2, target: 1000, moves: 18, description: '初级挑战' },
  { level: 3, target: 1800, moves: 16, description: '中级闯关' },
  { level: 4, target: 2800, moves: 15, description: '高级挑战' },
  { level: 5, target: 4000, moves: 14, description: '终极考验' }
]

export function useGameLogic() {
  const grid = ref([])
  const score = ref(0)
  const movesLeft = ref(0)
  const currentLevel = ref(1)
  const selectedCell = ref(null)
  const isProcessing = ref(false)
  const gameStatus = ref('playing') // playing, won, lost
  const animatingCells = ref(new Set())
  const comboCount = ref(0)

  const levelConfig = computed(() => LEVELS[currentLevel.value - 1])
  const targetScore = computed(() => levelConfig.value.target)

  function randomFruit() {
    return FRUITS[Math.floor(Math.random() * FRUITS.length)]
  }

  function createCell(row, col, fruit = null) {
    return {
      id: `${row}-${col}-${Date.now()}-${Math.random()}`,
      row,
      col,
      fruit: fruit || randomFruit(),
      state: 'idle' // idle, selected, swapping, eliminating, dropping, appearing
    }
  }

  function initGrid() {
    const newGrid = []
    for (let r = 0; r < ROWS; r++) {
      const row = []
      for (let c = 0; c < COLS; c++) {
        let cell = createCell(r, c)
        // Avoid initial matches
        while (hasInitialMatch(newGrid, row, r, c, cell.fruit)) {
          cell = createCell(r, c)
        }
        row.push(cell)
      }
      newGrid.push(row)
    }
    grid.value = newGrid
  }

  function hasInitialMatch(prevRows, currentRow, row, col, fruit) {
    // Check horizontal (left 2)
    if (col >= 2) {
      if (currentRow[col - 1]?.fruit === fruit && currentRow[col - 2]?.fruit === fruit) {
        return true
      }
    }
    // Check vertical (up 2)
    if (row >= 2) {
      if (prevRows[row - 1]?.[col]?.fruit === fruit && prevRows[row - 2]?.[col]?.fruit === fruit) {
        return true
      }
    }
    return false
  }

  function startLevel(level) {
    currentLevel.value = level
    score.value = 0
    movesLeft.value = levelConfig.value.moves
    gameStatus.value = 'playing'
    selectedCell.value = null
    comboCount.value = 0
    initGrid()
  }

  function selectCell(row, col) {
    if (isProcessing.value || gameStatus.value !== 'playing') return

    const cell = grid.value[row][col]

    if (!selectedCell.value) {
      selectedCell.value = { row, col }
      cell.state = 'selected'
      return
    }

    const prev = selectedCell.value
    if (prev.row === row && prev.col === col) {
      grid.value[prev.row][prev.col].state = 'idle'
      selectedCell.value = null
      return
    }

    // Check adjacency (no diagonal)
    const isAdjacent =
      (Math.abs(prev.row - row) === 1 && prev.col === col) ||
      (Math.abs(prev.col - col) === 1 && prev.row === row)

    if (!isAdjacent) {
      grid.value[prev.row][prev.col].state = 'idle'
      selectedCell.value = { row, col }
      cell.state = 'selected'
      return
    }

    grid.value[prev.row][prev.col].state = 'idle'
    selectedCell.value = null
    trySwap(prev.row, prev.col, row, col)
  }

  async function trySwap(r1, c1, r2, c2) {
    isProcessing.value = true

    // Perform swap
    swap(r1, c1, r2, c2)
    await animateSwap(r1, c1, r2, c2)

    // Check for matches
    const matches = findMatches()
    if (matches.length > 0) {
      movesLeft.value--
      comboCount.value = 0
      await processMatches(matches)
      checkGameStatus()
    } else {
      // Swap back (invalid move)
      swap(r1, c1, r2, c2)
      grid.value[r1][c1].state = 'invalid-swap'
      grid.value[r2][c2].state = 'invalid-swap'
      await delay(400)
      grid.value[r1][c1].state = 'idle'
      grid.value[r2][c2].state = 'idle'
    }

    isProcessing.value = false
  }

  function swap(r1, c1, r2, c2) {
    const temp = grid.value[r1][c1].fruit
    grid.value[r1][c1].fruit = grid.value[r2][c2].fruit
    grid.value[r2][c2].fruit = temp
  }

  async function animateSwap(r1, c1, r2, c2) {
    grid.value[r1][c1].state = 'swapping'
    grid.value[r2][c2].state = 'swapping'
    await delay(300)
    grid.value[r1][c1].state = 'idle'
    grid.value[r2][c2].state = 'idle'
  }

  function findMatches() {
    const matches = new Set()

    // Horizontal matches
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 2; c++) {
        const fruit = grid.value[r][c].fruit
        if (!fruit) continue
        let count = 1
        while (c + count < COLS && grid.value[r][c + count].fruit === fruit) {
          count++
        }
        if (count >= 3) {
          for (let i = 0; i < count; i++) {
            matches.add(`${r},${c + i}`)
          }
        }
      }
    }

    // Vertical matches
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 2; r++) {
        const fruit = grid.value[r][c].fruit
        if (!fruit) continue
        let count = 1
        while (r + count < ROWS && grid.value[r + count][c].fruit === fruit) {
          count++
        }
        if (count >= 3) {
          for (let i = 0; i < count; i++) {
            matches.add(`${r + i},${c}`)
          }
        }
      }
    }

    return Array.from(matches).map(key => {
      const [r, c] = key.split(',').map(Number)
      return { row: r, col: c }
    })
  }

  function calculateScore(matchCount) {
    let base = 0
    if (matchCount === 3) base = 30
    else if (matchCount === 4) base = 60
    else if (matchCount >= 5) base = 100

    const comboMultiplier = comboCount.value > 0 ? 1.5 : 1
    return Math.floor(base * comboMultiplier)
  }

  async function processMatches(matches) {
    // Calculate score based on match groups
    const matchGroups = groupMatches(matches)
    let roundScore = 0
    for (const group of matchGroups) {
      roundScore += calculateScore(group.length)
    }
    score.value += roundScore
    comboCount.value++

    // Animate elimination
    for (const { row, col } of matches) {
      grid.value[row][col].state = 'eliminating'
    }
    await delay(400)

    // Clear matched cells
    for (const { row, col } of matches) {
      grid.value[row][col].fruit = null
      grid.value[row][col].state = 'idle'
    }

    // Apply gravity
    await applyGravity()

    // Fill empty cells
    await fillEmpty()

    // Chain reaction
    const newMatches = findMatches()
    if (newMatches.length > 0) {
      await processMatches(newMatches)
    }
  }

  function groupMatches(matches) {
    const visited = new Set()
    const groups = []

    for (const match of matches) {
      const key = `${match.row},${match.col}`
      if (visited.has(key)) continue

      const group = []
      const queue = [match]
      while (queue.length > 0) {
        const curr = queue.shift()
        const currKey = `${curr.row},${curr.col}`
        if (visited.has(currKey)) continue
        visited.add(currKey)
        group.push(curr)

        for (const other of matches) {
          const otherKey = `${other.row},${other.col}`
          if (visited.has(otherKey)) continue
          if (
            (Math.abs(curr.row - other.row) === 1 && curr.col === other.col) ||
            (Math.abs(curr.col - other.col) === 1 && curr.row === other.row)
          ) {
            if (grid.value[curr.row][curr.col].fruit === grid.value[other.row][other.col].fruit) {
              queue.push(other)
            }
          }
        }
      }
      if (group.length > 0) groups.push(group)
    }
    return groups
  }

  async function applyGravity() {
    let hasDropped = false

    for (let c = 0; c < COLS; c++) {
      let emptyRow = ROWS - 1
      for (let r = ROWS - 1; r >= 0; r--) {
        if (grid.value[r][c].fruit !== null) {
          if (r !== emptyRow) {
            const dropDistance = (emptyRow - r) * 62
            grid.value[emptyRow][c].fruit = grid.value[r][c].fruit
            grid.value[emptyRow][c].state = 'dropping'
            grid.value[emptyRow][c].dropDistance = dropDistance
            grid.value[r][c].fruit = null
            hasDropped = true
          }
          emptyRow--
        }
      }
    }

    if (hasDropped) {
      await delay(500)
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid.value[r][c].state === 'dropping') {
            grid.value[r][c].state = 'idle'
          }
        }
      }
    }
  }

  async function fillEmpty() {
    let hasFilled = false

    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (grid.value[r][c].fruit === null) {
          grid.value[r][c].fruit = randomFruit()
          grid.value[r][c].state = 'appearing'
          grid.value[r][c].id = `${r}-${c}-${Date.now()}-${Math.random()}`
          hasFilled = true
        }
      }
    }

    if (hasFilled) {
      await delay(400)
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid.value[r][c].state === 'appearing') {
            grid.value[r][c].state = 'idle'
          }
        }
      }
    }
  }

  function checkGameStatus() {
    if (score.value >= targetScore.value) {
      gameStatus.value = 'won'
    } else if (movesLeft.value <= 0) {
      gameStatus.value = 'lost'
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  return {
    grid,
    score,
    movesLeft,
    currentLevel,
    selectedCell,
    isProcessing,
    gameStatus,
    levelConfig,
    targetScore,
    comboCount,
    LEVELS,
    startLevel,
    selectCell
  }
}
