import { ref, computed, onUnmounted } from 'vue'

const ROWS = 8
const COLS = 8
const FRUITS = ['🍎', '🍊', '🍋', '🍇', '🍒', '🥝']

const LEVELS = [
  { level: 1, target: 500, moves: 20, description: '入门关卡' },
  { level: 2, target: 1000, moves: 18, description: '初级挑战' },
  { level: 3, target: 1800, moves: 16, description: '中级闯关' },
  { level: 4, target: 2800, moves: 15, description: '高级挑战' },
  { level: 5, target: 4000, moves: 14, description: '终极考验' },
  { level: 6, target: 5500, moves: 13, description: '勇者之路' },
  { level: 7, target: 7200, moves: 12, description: '大师挑战' },
  { level: 8, target: 9000, moves: 11, description: '传奇之战' },
  { level: 9, target: 11000, moves: 10, description: '极限冲击' },
  { level: 10, target: 13500, moves: 9, description: '王者巅峰' }
]

export function useGameLogic() {
  const grid = ref([])
  const score = ref(0)
  const movesLeft = ref(0)
  const currentLevel = ref(1)
  const selectedCell = ref(null)
  const isProcessing = ref(false)
  const gameStatus = ref('playing')
  const animatingCells = ref(new Set())
  const comboCount = ref(0)
  const hintTimer = ref(null)
  const hintedCells = ref([])

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
      special: null,
      hinted: false,
      state: 'idle'
    }
  }

  function initGrid() {
    const newGrid = []
    for (let r = 0; r < ROWS; r++) {
      const row = []
      for (let c = 0; c < COLS; c++) {
        let cell = createCell(r, c)
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
    if (col >= 2) {
      if (currentRow[col - 1]?.fruit === fruit && currentRow[col - 2]?.fruit === fruit) {
        return true
      }
    }
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
    resetHintTimer()
  }

  function selectCell(row, col) {
    if (isProcessing.value || gameStatus.value !== 'playing') return

    clearHint()
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

    const cell1 = grid.value[r1][c1]
    const cell2 = grid.value[r2][c2]

    // Bomb activation
    if (cell1.special === 'bomb' || cell2.special === 'bomb') {
      const bombCell = cell1.special === 'bomb' ? cell1 : cell2
      const targetCell = cell1.special === 'bomb' ? cell2 : cell1
      const targetFruit = targetCell.fruit

      await animateSwap(r1, c1, r2, c2)
      movesLeft.value--
      comboCount.value = 0

      const toEliminate = []
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid.value[r][c].fruit === targetFruit) {
            toEliminate.push({ row: r, col: c })
          }
        }
      }
      toEliminate.push({ row: bombCell.row, col: bombCell.col })

      score.value += toEliminate.length * 20

      for (const { row, col } of toEliminate) {
        grid.value[row][col].state = 'eliminating'
      }
      await delay(500)
      for (const { row, col } of toEliminate) {
        grid.value[row][col].fruit = null
        grid.value[row][col].special = null
        grid.value[row][col].state = 'idle'
      }

      await applyGravity()
      await fillEmpty()
      const newMatches = findMatches()
      if (newMatches.length > 0) {
        const groups = findMatchGroupsWithDirection()
        await processMatches(newMatches, groups, null)
      }
      checkGameStatus()
      isProcessing.value = false
      resetHintTimer()
      return
    }

    // Normal swap
    swap(r1, c1, r2, c2)
    await animateSwap(r1, c1, r2, c2)

    const matches = findMatches()
    if (matches.length > 0) {
      movesLeft.value--
      comboCount.value = 0
      const groups = findMatchGroupsWithDirection()
      await processMatches(matches, groups, { row: r1, col: c1 })
      checkGameStatus()
    } else {
      swap(r1, c1, r2, c2)
      grid.value[r1][c1].state = 'invalid-swap'
      grid.value[r2][c2].state = 'invalid-swap'
      await delay(400)
      grid.value[r1][c1].state = 'idle'
      grid.value[r2][c2].state = 'idle'
    }

    isProcessing.value = false
    resetHintTimer()
  }

  function swap(r1, c1, r2, c2) {
    const tempFruit = grid.value[r1][c1].fruit
    const tempSpecial = grid.value[r1][c1].special
    grid.value[r1][c1].fruit = grid.value[r2][c2].fruit
    grid.value[r1][c1].special = grid.value[r2][c2].special
    grid.value[r2][c2].fruit = tempFruit
    grid.value[r2][c2].special = tempSpecial
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

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 2; c++) {
        const fruit = grid.value[r][c].fruit
        if (!fruit || grid.value[r][c].special === 'bomb') continue
        let count = 1
        while (c + count < COLS && grid.value[r][c + count].fruit === fruit && grid.value[r][c + count].special !== 'bomb') {
          count++
        }
        if (count >= 3) {
          for (let i = 0; i < count; i++) {
            matches.add(`${r},${c + i}`)
          }
        }
      }
    }

    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 2; r++) {
        const fruit = grid.value[r][c].fruit
        if (!fruit || grid.value[r][c].special === 'bomb') continue
        let count = 1
        while (r + count < ROWS && grid.value[r + count][c].fruit === fruit && grid.value[r + count][c].special !== 'bomb') {
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

  function findMatchGroupsWithDirection() {
    const groups = []

    for (let r = 0; r < ROWS; r++) {
      let c = 0
      while (c < COLS) {
        const fruit = grid.value[r][c].fruit
        if (!fruit || grid.value[r][c].special === 'bomb') { c++; continue }
        let count = 1
        while (c + count < COLS && grid.value[r][c + count].fruit === fruit && grid.value[r][c + count].special !== 'bomb') count++
        if (count >= 3) {
          const cells = []
          for (let i = 0; i < count; i++) cells.push({ row: r, col: c + i })
          groups.push({ cells, direction: 'horizontal', length: count, fruit })
        }
        c += count
      }
    }

    for (let c = 0; c < COLS; c++) {
      let r = 0
      while (r < ROWS) {
        const fruit = grid.value[r][c].fruit
        if (!fruit || grid.value[r][c].special === 'bomb') { r++; continue }
        let count = 1
        while (r + count < ROWS && grid.value[r + count][c].fruit === fruit && grid.value[r + count][c].special !== 'bomb') count++
        if (count >= 3) {
          const cells = []
          for (let i = 0; i < count; i++) cells.push({ row: r + i, col: c })
          groups.push({ cells, direction: 'vertical', length: count, fruit })
        }
        r += count
      }
    }

    return groups
  }

  function pickSpawnPosition(cells, swapPos) {
    if (swapPos) {
      const inGroup = cells.find(c => c.row === swapPos.row && c.col === swapPos.col)
      if (inGroup) return inGroup
    }
    return cells[Math.floor(cells.length / 2)]
  }

  function expandMatchesWithSpecials(matchedCells) {
    const expanded = new Set(matchedCells.map(c => `${c.row},${c.col}`))
    const toProcess = [...matchedCells]

    while (toProcess.length > 0) {
      const cell = toProcess.shift()
      const gridCell = grid.value[cell.row][cell.col]
      if (gridCell.special === 'line-h') {
        for (let c = 0; c < COLS; c++) {
          const key = `${cell.row},${c}`
          if (!expanded.has(key)) {
            expanded.add(key)
            toProcess.push({ row: cell.row, col: c })
          }
        }
      } else if (gridCell.special === 'line-v') {
        for (let r = 0; r < ROWS; r++) {
          const key = `${r},${cell.col}`
          if (!expanded.has(key)) {
            expanded.add(key)
            toProcess.push({ row: r, col: cell.col })
          }
        }
      }
    }

    return Array.from(expanded).map(k => {
      const [r, c] = k.split(',').map(Number)
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

  async function processMatches(matches, groups, swapPos) {
    const specialSpawns = []

    for (const group of groups) {
      if (group.length >= 5) {
        const spawnCell = pickSpawnPosition(group.cells, swapPos)
        specialSpawns.push({ ...spawnCell, special: 'bomb', fruit: '💫' })
      } else if (group.length === 4) {
        const spawnCell = pickSpawnPosition(group.cells, swapPos)
        specialSpawns.push({
          ...spawnCell,
          special: group.direction === 'horizontal' ? 'line-h' : 'line-v',
          fruit: group.fruit
        })
      }
    }

    const spawnKeys = new Set(specialSpawns.map(s => `${s.row},${s.col}`))

    // Expand matches if any matched cells have line-clear specials
    const expandedMatches = expandMatchesWithSpecials(matches)

    // Calculate score
    let roundScore = 0
    const matchGroups = groupMatches(matches)
    for (const group of matchGroups) {
      roundScore += calculateScore(group.length)
    }
    const extraFromSpecials = expandedMatches.length - matches.length
    if (extraFromSpecials > 0) {
      roundScore += extraFromSpecials * 15
    }
    score.value += roundScore
    comboCount.value++

    // Animate elimination
    for (const { row, col } of expandedMatches) {
      if (!spawnKeys.has(`${row},${col}`)) {
        grid.value[row][col].state = 'eliminating'
      }
    }
    await delay(400)

    // Clear matched cells
    for (const { row, col } of expandedMatches) {
      if (!spawnKeys.has(`${row},${col}`)) {
        grid.value[row][col].fruit = null
        grid.value[row][col].special = null
        grid.value[row][col].state = 'idle'
      }
    }

    // Apply special spawns
    for (const spawn of specialSpawns) {
      grid.value[spawn.row][spawn.col].special = spawn.special
      grid.value[spawn.row][spawn.col].fruit = spawn.fruit
      grid.value[spawn.row][spawn.col].state = 'appearing'
    }
    if (specialSpawns.length > 0) await delay(300)
    for (const spawn of specialSpawns) {
      grid.value[spawn.row][spawn.col].state = 'idle'
    }

    await applyGravity()
    await fillEmpty()

    // Chain reaction
    const newMatches = findMatches()
    if (newMatches.length > 0) {
      const newGroups = findMatchGroupsWithDirection()
      await processMatches(newMatches, newGroups, null)
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
            grid.value[emptyRow][c].special = grid.value[r][c].special
            grid.value[emptyRow][c].state = 'dropping'
            grid.value[emptyRow][c].dropDistance = dropDistance
            grid.value[r][c].fruit = null
            grid.value[r][c].special = null
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
          grid.value[r][c].special = null
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
      stopHintTimer()
    } else if (movesLeft.value <= 0) {
      gameStatus.value = 'lost'
      stopHintTimer()
    }
  }

  // --- Hint System ---

  function checkMatchAt(row, col) {
    const fruit = grid.value[row][col].fruit
    if (!fruit || grid.value[row][col].special === 'bomb') return false

    let hCount = 1
    let c = col - 1
    while (c >= 0 && grid.value[row][c].fruit === fruit && grid.value[row][c].special !== 'bomb') { hCount++; c-- }
    c = col + 1
    while (c < COLS && grid.value[row][c].fruit === fruit && grid.value[row][c].special !== 'bomb') { hCount++; c++ }
    if (hCount >= 3) return true

    let vCount = 1
    let r = row - 1
    while (r >= 0 && grid.value[r][col].fruit === fruit && grid.value[r][col].special !== 'bomb') { vCount++; r-- }
    r = row + 1
    while (r < ROWS && grid.value[r][col].fruit === fruit && grid.value[r][col].special !== 'bomb') { vCount++; r++ }
    if (vCount >= 3) return true

    return false
  }

  function findValidMove() {
    const directions = [[0, 1], [1, 0]]

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        for (const [dr, dc] of directions) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= ROWS || nc >= COLS) continue
          if (!grid.value[r][c].fruit || !grid.value[nr][nc].fruit) continue

          // Bomb can always swap
          if (grid.value[r][c].special === 'bomb' || grid.value[nr][nc].special === 'bomb') {
            return [{ row: r, col: c }, { row: nr, col: nc }]
          }

          // Virtual swap
          const temp = grid.value[r][c].fruit
          grid.value[r][c].fruit = grid.value[nr][nc].fruit
          grid.value[nr][nc].fruit = temp

          const hasMatch = checkMatchAt(r, c) || checkMatchAt(nr, nc)

          grid.value[nr][nc].fruit = grid.value[r][c].fruit
          grid.value[r][c].fruit = temp

          if (hasMatch) {
            return [{ row: r, col: c }, { row: nr, col: nc }]
          }
        }
      }
    }
    return null
  }

  function resetHintTimer() {
    clearHint()
    if (hintTimer.value) {
      clearTimeout(hintTimer.value)
      hintTimer.value = null
    }
    if (gameStatus.value !== 'playing') return
    hintTimer.value = setTimeout(showHint, 15000)
  }

  function showHint() {
    if (gameStatus.value !== 'playing' || isProcessing.value) return
    const move = findValidMove()
    if (move) {
      hintedCells.value = move
      grid.value[move[0].row][move[0].col].hinted = true
      grid.value[move[1].row][move[1].col].hinted = true
    } else {
      shuffleBoard()
    }
  }

  function clearHint() {
    for (const cell of hintedCells.value) {
      if (grid.value[cell.row]?.[cell.col]) {
        grid.value[cell.row][cell.col].hinted = false
      }
    }
    hintedCells.value = []
  }

  function stopHintTimer() {
    clearHint()
    if (hintTimer.value) {
      clearTimeout(hintTimer.value)
      hintTimer.value = null
    }
  }

  function shuffleBoard() {
    const allFruits = []
    const specialCells = []

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid.value[r][c].special) {
          specialCells.push({ row: r, col: c, special: grid.value[r][c].special, fruit: grid.value[r][c].fruit })
        } else {
          allFruits.push(grid.value[r][c].fruit)
        }
      }
    }

    // Fisher-Yates shuffle
    for (let i = allFruits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allFruits[i], allFruits[j]] = [allFruits[j], allFruits[i]]
    }

    let idx = 0
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!grid.value[r][c].special) {
          grid.value[r][c].fruit = allFruits[idx++]
          grid.value[r][c].state = 'appearing'
          grid.value[r][c].id = `${r}-${c}-${Date.now()}-${Math.random()}`
        }
      }
    }

    setTimeout(() => {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid.value[r][c].state === 'appearing') {
            grid.value[r][c].state = 'idle'
          }
        }
      }
      // Check if shuffle created matches or if still no moves
      const matches = findMatches()
      if (matches.length > 0) {
        const groups = findMatchGroupsWithDirection()
        processMatches(matches, groups, null).then(() => {
          checkGameStatus()
          resetHintTimer()
        })
      } else if (!findValidMove()) {
        shuffleBoard()
      } else {
        resetHintTimer()
      }
    }, 450)
  }

  function cleanup() {
    stopHintTimer()
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
    hintedCells,
    LEVELS,
    startLevel,
    selectCell,
    cleanup
  }
}
