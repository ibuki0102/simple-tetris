document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  const miniGrid = document.querySelector('.mini-grid')
  const scoreDisplay = document.querySelector('#score')
  const startBtn = document.querySelector('.start-button')
  const oneSecondButton = document.querySelector('.default-button')
  const pointSevenSecondButton = document.querySelector('.faster-button')
  const pointFourSecondButton = document.querySelector('.fastest-button')

  let score = 0
  let timerId
  let color
  let nextColor
  let speed = 1000

  const width = 10
  const height = 20
  let nextRandom = 0
  // 使用template方式來渲染html
  let totalGrid = ''
  for (let i = 0; i < width * height; i++) {
    totalGrid += `<div></div>`
  }
  // 最底層的方塊
  for (let i = 0; i < 10; i++) {
    totalGrid += `<div class="taken"></div>`
  }
  grid.innerHTML = totalGrid

  // 使用template方式渲染預覽區塊
  let totalMiniGrid = ''
  for (let i = 0; i < 16; i++) {
    totalMiniGrid += `<div></div>`
  }
  miniGrid.innerHTML = totalMiniGrid

  let squares = Array.from(document.querySelectorAll('.grid div'))

  // 俄羅斯方塊以及其旋轉的樣式，[0]為初始樣式，[1,2,3]為旋轉後的樣式
  const lTetrominoes = [
    [1, width + 1, width * 2 + 1, 2],
    [width, width + 1, width + 2, width * 2 + 2],
    [1, width + 1, , width * 2, width * 2 + 1],
    [width, width * 2, width * 2 + 1, width * 2 + 2],
  ]
  const zTetromino = [
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
    [0, width, width + 1, width * 2 + 1],
    [width + 1, width + 2, width * 2, width * 2 + 1],
  ]
  const tTetromino = [
    [1, width, width + 1, width + 2],
    [1, width + 1, width + 2, width * 2 + 1],
    [width, width + 1, width + 2, width * 2 + 1],
    [1, width, width + 1, width * 2 + 1],
  ]
  const oTetromino = [
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
    [0, 1, width, width + 1],
  ]
  const iTetromino = [
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
    [1, width + 1, width * 2 + 1, width * 3 + 1],
    [width, width + 1, width + 2, width + 3],
  ]

  const theTetrominoes = [
    lTetrominoes,
    zTetromino,
    tTetromino,
    oTetromino,
    iTetromino,
  ]

  const checkColor = (random) => {
    // 依據俄羅斯方塊的種類來配色
    if (random === 0) {
      color = 'crimson'
    } else if (random === 1) {
      color = 'coral'
    } else if (random === 2) {
      color = 'gold'
    } else if (random === 3) {
      color = 'lime'
    } else if (random === 4) {
      color = 'deepskyblue'
    }
  }
  const checkNextColor = (nextRandom) => {
    // 依據俄羅斯方塊的種類來配色
    if (nextRandom === 0) {
      nextColor = 'crimson'
    } else if (nextRandom === 1) {
      nextColor = 'coral'
    } else if (nextRandom === 2) {
      nextColor = 'gold'
    } else if (nextRandom === 3) {
      nextColor = 'lime'
    } else if (nextRandom === 4) {
      nextColor = 'deepskyblue'
    }
  }

  // 起始降落點為第一列的中央，大約是index = 4的位置
  let currentPosition = 4
  // 起始的樣式都是為旋轉過的第一個樣式
  let currentRotation = 0
  // 隨機選擇一組樣式需要用到的random值
  let random = Math.floor(Math.random() * theTetrominoes.length)
  checkColor(random)
  // 預設第一個俄羅斯方塊的形狀為L的第一個形狀
  let current = theTetrominoes[random][currentRotation]

  // 繪製俄羅斯方塊
  const draw = () => {
    current.forEach((index) => {
      squares[currentPosition + index].classList.add('tetromino')
      squares[currentPosition + index].style.backgroundColor = color
    })
  }
  // 移除俄羅斯方塊
  const undraw = () => {
    current.forEach((index) => {
      squares[currentPosition + index].classList.remove('tetromino')
      squares[currentPosition + index].style.backgroundColor = ''
    })
  }

  // 偵測按鍵並控制俄羅斯方塊
  const control = (e) => {
    if (e.keyCode === 37) {
      moveLeft()
    } else if (e.keyCode === 38) {
      rotate()
    } else if (e.keyCode === 39) {
      moveRight()
    } else if (e.keyCode === 40) {
      moveDown()
    }
  }

  document.addEventListener('keyup', control)

  const moveDown = () => {
    undraw()
    currentPosition += width
    draw()
    freeze()
  }
  //   timerId = setInterval(moveDown, 1000)

  // 讓俄羅斯方塊在接觸到最底時停下
  const freeze = () => {
    if (
      current.some((index) =>
        squares[currentPosition + index + width].classList.contains('taken')
      )
    ) {
      current.forEach((index) => {
        squares[currentPosition + index].classList.add('taken')
      })
      random = nextRandom
      nextRandom = Math.floor(Math.random() * theTetrominoes.length)
      // 依據俄羅斯方塊的種類來配色
      checkColor(random)
      // current為當前的俄羅斯方塊
      current = theTetrominoes[random][currentRotation]
      currentPosition = 4
      draw()
      addScore()
      gameover()
      displayShape()
    }
  }

  // 往左移動
  const moveLeft = () => {
    undraw()
    // 判斷是否位於最左或最右
    const isAtLeftEdge = current.some(
      (index) => (currentPosition + index) % width === 0
    )
    if (!isAtLeftEdge) currentPosition -= 1
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains('taken')
      )
    ) {
      currentPosition += 1
    }
    draw()
  }

  // 往右移動
  const moveRight = () => {
    undraw()
    // 判斷是否位於最左或最右
    const isAtLeftEdge = current.some(
      (index) => (currentPosition + index) % width === width - 1
    )
    if (!isAtLeftEdge) currentPosition += 1
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains('taken')
      )
    ) {
      currentPosition -= 1
    }
    draw()
  }

  // 旋轉
  const rotate = () => {
    undraw()
    // 透過增加index來讓俄羅斯方塊顯示成下一個旋轉後的樣式
    currentRotation++
    // 如果已經是最後一個旋轉後的樣式，則會到第一個
    if (currentRotation === current.length) {
      currentRotation = 0
    }
    // 設定目前的俄羅斯方塊的樣式
    current = theTetrominoes[random][currentRotation]
    draw()
  }

  // 顯示下一個要降落的俄羅斯方塊之前的前置動作
  const displaySquares = document.querySelectorAll('.mini-grid div')
  // 顯示區塊的寬度4格
  const displayWidth = 4
  let displayIndex = 0

  // 接下來的俄羅斯方塊會是五種樣式的其中一個
  const upNextTetrominoes = [
    [1, displayWidth + 1, displayWidth * 2 + 1, 2],
    [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
    [1, displayWidth, displayWidth + 1, displayWidth + 2],
    [0, 1, displayWidth, displayWidth + 1],
    [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1],
  ]
  // 顯示接下來的俄羅斯方塊
  const displayShape = () => {
    // 移除所有在預覽區的顯示的任何俄羅斯方塊，這個動作跟undraw很像
    displaySquares.forEach((square) => {
      square.classList.remove('tetromino')
      square.style.backgroundColor = ''
    })
    // 將相對應的index格子加上class
    upNextTetrominoes[nextRandom].forEach((index) => {
      displaySquares[displayIndex + index].classList.add('tetromino')
      checkNextColor(nextRandom)
      displaySquares[displayIndex + index].style.backgroundColor = nextColor
    })
  }

  // 按下開始/暫停
  startBtn.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    } else {
      draw()
      timerId = setInterval(moveDown, speed)
      displayShape()
    }
  })

  // 在調整降落速度的按鈕上加上監聽器
  oneSecondButton.addEventListener('click', () => {
    speed = 1000
    clearInterval(timerId)
    timerId = setInterval(moveDown, speed)
  })
  pointSevenSecondButton.addEventListener('click', () => {
    speed = 700
    clearInterval(timerId)
    timerId = setInterval(moveDown, speed)
  })
  pointFourSecondButton.addEventListener('click', () => {
    speed = 400
    clearInterval(timerId)
    timerId = setInterval(moveDown, speed)
  })

  // 消除填滿的列並增加分數
  const addScore = () => {
    // 每一輪i的值都會+10，等於去偵測每一列的每一格
    for (let i = 0; i < 199; i += width) {
      const row = [
        i,
        i + 1,
        i + 2,
        i + 3,
        i + 4,
        i + 5,
        i + 6,
        i + 7,
        i + 8,
        i + 9,
      ]
      if (row.every((index) => squares[index].classList.contains('taken'))) {
        score += 10
        scoreDisplay.innerHTML = score
        // 消除這一列的taken class
        row.forEach((index) => {
          squares[index].classList.remove('taken')
          squares[index].classList.remove('tetromino')
          squares[index].style.backgroundColor = ''
        })
        // 從index為i這個格子開始數10格並存到變數裡
        const squareRemove = squares.splice(i, width)
        // 新的squares陣列會是被移除的那列+上原本的陣列 = 把移除的陣列推到原陣列的起始點
        squares = squareRemove.concat(squares)
        // squares只是我們用array from取出的陣列，還是要將陣列append回去DOM節點(grid)才會生效
        squares.forEach((cell) => grid.appendChild(cell))
      }
    }
  }

  const gameover = () => {
    if (
      current.some((index) =>
        squares[currentPosition + index].classList.contains('taken')
      )
    ) {
      scoreDisplay.innerHTML = `GameOver, Your total score is ${score}.`
      clearInterval(timerId)
    }
  }
})
