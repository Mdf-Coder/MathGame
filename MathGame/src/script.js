////// Game PreConfigs To Recognize if User Using Mobile or Pc ////////////
window.addEventListener('resize', function () {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        document.body.setAttribute('data-theme', 'mobile')
    } else {
        document.body.setAttribute('data-theme', '')
    }
})

////////////////////////////////////////////////////////////////////////////////////////

/////// Change Input To Readonly='off' ///////////
document.querySelector('#change-player-1').addEventListener('click', function () {
    document.querySelector('#player-1-name').removeAttribute('readonly')
    document.querySelector('#player-1-name').focus()
})

document.querySelector('#change-player-2').addEventListener('click', function () {
    document.querySelector('#player-2-name').removeAttribute('readonly')
    document.querySelector('#player-2-name').focus()
})

//////////////////////////////////////////////////////////////////////////////////////

////// Game Start Functions ///////
window.addEventListener('keyup', startGameHandler)
document.querySelector('#start-game-btn').addEventListener('click', startGameHandler)

// Start Game
function startGameHandler(event) {
    // Check If User Have Pressed Enter / Space / Click (Usually On Mobile)
    if (['Space', 'Enter'].includes(event.code) || ['click'].includes(event.type)) {
        window.removeEventListener('keyup', startGameHandler)

        // Show / Hide Stuff from User
        document.querySelector('#game-config-result').classList.add('game-started-Config')
        document.querySelector('#game-page').classList.remove('game-started-Config')
        document.querySelector('#pre-start-count-down').classList.remove('game-started-Config')
        document.querySelector('#game-container').classList.add('blur-2xl')

        // Start Timer --> Not To Jump Into Game To Quick
        let countDownTimer = document.getElementById('count-down-timer-audio')
        countDownTimer.volume = 0.3
        countDownTimer.play()
        let timerCountDown = 2
        let timer = setInterval(function () {
            document.querySelector('#start-countdown-timer').innerHTML = timerCountDown.toString()
            timerCountDown--
            if (timerCountDown <= -1) {
                document.querySelector('#pre-start-count-down').classList.add('game-started-Config')
                document.querySelector('#start-countdown-timer').classList.remove('animate-bounce')
                document.querySelector('#game-container').classList.remove('blur-2xl')

                countDownTimer.pause()
                countDownTimer.currentTime = 0
                gameHandler()
                clearInterval(timer)
            }
        }, 1150)

        getGameConfigs()
    }
}

//////////////////////////////////////////////////////////////////////////////////////


///////// Configs /////////
let qsTimer = document.getElementById('qs-timer') ,roundQsAnswer, userDevice, questions, gameDifficulty, gameQsNums, playerNameFirst,
    playerNameSecond, playerScores = {}, playerMistakes = {},
    winAudio = document.getElementById('win-audio'),
    loseAudio = document.getElementById('lose-audio'),
    drawAudio = document.getElementById('draw-audio')


// Get Config Function
function getGameConfigs() {
    if (/Mobi|Android/i.test(navigator.userAgent)) {
        userDevice = 'Mobile'
    } else {
        userDevice = 'PC'
    }

    let gameDifficultyIn = document.querySelector('input[name="difficulty"]:checked').value;
    let gameQsNumsIn = document.querySelector('input[name="qs-num"]:checked').value;
    let playerNameFirstIn = document.getElementById('player-1-name'); // To See Name Use PlayerNameFirst.value
    let playerNameSecondIn = document.getElementById('player-2-name'); // To See Name Use PlayerNameSecond.value
    if (gameDifficultyIn === 'Easy') {
        gameDifficultyIn = 20
    } else if (gameDifficultyIn === 'Hard') {
        gameDifficultyIn = 100
    } else {
        gameDifficultyIn = 50
    }
    gameDifficulty = gameDifficultyIn
    gameQsNums = Number(gameQsNumsIn)
    playerNameFirst = playerNameFirstIn.value.trim() || 'Player-1'
    playerNameSecond = playerNameSecondIn.value.trim() || 'Player-2'
    playerScores[playerNameFirst] = 0
    playerScores[playerNameSecond] = 0
    playerMistakes[playerNameFirst] = 0
    playerMistakes[playerNameSecond] = 0

//     Change players name and score in DOM
    PlayerNameHandler(playerNameFirst, playerNameSecond)
//     Generate Questions
    questions = gameQsGenerator()
}

//////////////////////////////////////////////////////////////////////////////////////

///////// Show Names In DOM //////////
function PlayerNameHandler(name1, name2) {

    // PC / Mobile Player Names
    document.querySelectorAll('.player-1-info').forEach(function (element) {
        element.children[0].innerHTML = name1 + ' : '
    })
    document.querySelectorAll('.player-2-info').forEach(function (element) {
        element.children[0].innerHTML = name2 + ' : '
    })
    //////////// Scores ////////////
    document.querySelectorAll('.player-1-score').forEach(function (element) {
        element.innerHTML = playerScores[playerNameFirst]
    })
    document.querySelectorAll('.player-2-score').forEach(function (element) {
        element.innerHTML = playerScores[playerNameSecond]
    })
    ////////// Show Each PlayerName KeyBoard in Mobile /////////
    document.querySelector('#answer-box-player-1').firstElementChild.innerHTML = playerNameFirst
    document.querySelector('#answer-box-player-2').firstElementChild.innerHTML = playerNameSecond
}

//////////////////////////////////////////////////////////////////////////////////////

///////// Random Number Generator /////////
function randomNumberGenerator(range, startFromZeroOrOne) {
    return Math.floor(Math.random() * range) + startFromZeroOrOne
}

///////////////////////////////////////////////////////////////////////////////////////

//////////// Generate All Questions /////////////
let operators = ['+', '-', '/', '*', '^']
let numStatues = ['', '-']

function gameQsGenerator() {
    let allQs = []
    let rounds = gameQsNums
    // Generate Qs nth Time
    while (rounds > 0) {
        let qsOperator = operators[randomNumberGenerator(5, 0)]
        let qsFirstNum = randomNumberGenerator(gameDifficulty, 1)
        let qsFirstNumStatues = numStatues[randomNumberGenerator(2, 0)]
        // Second Num Generates Standard in Order To Have Better Experience
        let qsSecondNum
        let qsSecondNumStatues = ''
        if (qsOperator === '/') {
            qsSecondNum = randomNumberGenerator(9, 2)
        } else if (qsOperator === '^') {
            qsSecondNum = randomNumberGenerator(2, 2)
        } else {
            qsSecondNum = randomNumberGenerator(gameDifficulty, 1)
            qsSecondNumStatues = numStatues[randomNumberGenerator(2, 0)]
        }
        // Calculate Answer --> + - / * : has one way, ^ : has another way
        let answer
        if (qsOperator === '^') {
            let first = Number(`${qsFirstNumStatues}${qsFirstNum}`)
            let second = Number(`${qsSecondNumStatues}${qsSecondNum}`)
            answer = Math.pow(first, second)
        } else {
            answer = eval(`${qsFirstNumStatues}${qsFirstNum}
            ${qsOperator}
            ${qsSecondNumStatues}${qsSecondNum}`)
            answer = Number.isInteger(answer) ? answer : answer.toFixed(2)
        }
        // Config Generated Qs To Be Sent
        let qs = `${rounds} ${qsFirstNumStatues}${qsFirstNum} ${qsOperator} ${qsSecondNumStatues}${qsSecondNum} ${answer}`
        allQs.push(qs)
        rounds--
    }
    return allQs
}

//////////////////////////////////////////////////////////////////////

//////// Update DOM In Each Round /////////
function updateQsDOM(roundQs) {
    // Round Num1 Operator Num2 Answer

    let splitFunc = roundQs.split(' ')
    let firstNum = splitFunc[1]
    let operator = splitFunc[2]
    let secondNum = splitFunc[3]

    // PC Qs DOM
    document.getElementById('qs-number-count').innerHTML = splitFunc[0] + ')'
    document.getElementById('qs-num-1').innerHTML = firstNum
    document.getElementById('qs-operator').innerHTML = operator
    document.getElementById('qs-num-2').innerHTML = secondNum
    updateAnswersDOM(splitFunc[4])


    // Mobile Qs DOM
    document.querySelectorAll('.mobile-answer-box').forEach(function (element) {
        element.children[0].innerHTML = splitFunc[0] + ')'
        element.children[1].innerHTML = firstNum
        element.children[2].innerHTML = operator
        element.children[3].innerHTML = secondNum
    })

    return splitFunc[4]
}

//////////////////////////////////////////////////////////////////////

/////// Generate Fake Answers And Update DOM ///////
function updateAnswersDOM(realAnswer) {
    let places = [2, 3, 4, 5]
    let realAnswerPlace = randomNumberGenerator(4, 2)
    places.splice(places.indexOf(realAnswerPlace), 1)

    // First Fake Answer --> if Real = 0, random fake answer, if Real != 0, fake answer = -(Real)
    let fakeAnswer1 = realAnswer ? -(realAnswer) : Number(realAnswer) + randomNumberGenerator(12, 1)

    // if Fake Answers Become 0, it Creat Again
    let fakeAnswer2 = 0
    let fakeAnswer3 = 0
    while (fakeAnswer2 === 0) {
        fakeAnswer2 = Number(realAnswer) + randomNumberGenerator(12, 1)
        fakeAnswer3 = -(fakeAnswer2)
    }
    fakeAnswer2 = Number.isInteger(fakeAnswer2) ? fakeAnswer2 : fakeAnswer2.toFixed(2)
    fakeAnswer3 = Number.isInteger(fakeAnswer3) ? fakeAnswer3 : fakeAnswer3.toFixed(2)


    let fakeAnswers = [fakeAnswer1, fakeAnswer2, fakeAnswer3]


    // Change DOM for Real Answer
    document.getElementById('answer-box-player-1').children[realAnswerPlace].firstElementChild.innerHTML = realAnswer
    document.getElementById('answer-box-player-2').children[realAnswerPlace].firstElementChild.innerHTML = realAnswer

    // Change DOM for Fake answer
    for (let i = 0; i < 3; i++) {
        document.getElementById('answer-box-player-1').children[places[i]].firstElementChild.innerHTML = fakeAnswers[i]
        document.getElementById('answer-box-player-2').children[places[i]].firstElementChild.innerHTML = fakeAnswers[i]
    }
}

/////////////////////////////////////////////////////////////////////

/////// Finish Round ///////
function finishRound(whoWinOrLose, qsStatues, audioStatues) {
    let winLoseClassBg = qsStatues === true ? 'win-bg-grd' : qsStatues === false ? 'lose-bg-grd' : qsStatues === 'Draw' ? 'draw-bg-grd' : 'None'
    let winLoseClassText = qsStatues === true ? 'win-text' : qsStatues === false ? 'lose-text' : qsStatues === 'Draw' ? 'draw-text' : 'None'
    gameQsNums--
    if (gameQsNums > 0) {
        // Show If The User Answered Correct Or Not By Making The Screen Bg Change!
        document.getElementById('win-lose').classList.add(winLoseClassBg)
        document.getElementById('win-lose').firstElementChild.classList.add(winLoseClassText)
        document.getElementById('win-lose').firstElementChild.innerHTML = whoWinOrLose

        // Get Proper Audio And Play
        let audio = audioStatues === true ? winAudio : audioStatues === false ? loseAudio : audioStatues === 'Draw' ? drawAudio : 'None'
        audio.volume = 0.7
        audio.play()
        setTimeout(function () {

            // Remove Bg Colors That Shown For Correct Or InCorrect Answers
            for (let i = 2; i < 6; i++){
                document.querySelector('#answer-box-player-1').children[i].classList.remove('bg-emerald-400/50')
                document.querySelector('#answer-box-player-1').children[i].classList.remove('bg-rose-400/50')
                document.querySelector('#answer-box-player-2').children[i].classList.remove('bg-emerald-400/50')
                document.querySelector('#answer-box-player-2').children[i].classList.remove('bg-rose-400/50')
            }
            // Make The Screen Bg , Default Again
            document.getElementById('win-lose').classList.remove(winLoseClassBg)
            document.getElementById('win-lose').firstElementChild.classList.remove(winLoseClassText)
            document.getElementById('win-lose').firstElementChild.innerHTML = ''
            audio.pause()
            audio.currentTime = 0
            gameHandler()
        }, 2000)
    } else {
        // Finish Game --> Prepare Result Page
        // Define Winner / Or If Draw
        let winner
        if (playerScores[playerNameFirst] > playerScores[playerNameSecond]) {
            winner = playerNameFirst
        } else if (playerScores[playerNameFirst] === playerScores[playerNameSecond]) {
            winner = 'No Body :), Your Scores Are the Same!'
        } else {
            winner = playerNameSecond
        }
        // Update Result Page DOM
        document.getElementById('winner').innerHTML = winner
        document.getElementById('player-1-final-score').innerHTML = `${playerNameFirst} : ${playerScores[playerNameFirst]}`
        document.getElementById('player-2-final-score').innerHTML = `${playerNameSecond} : ${playerScores[playerNameSecond]}`
        // Hide And Show Needed Pages
        document.getElementById('game-page').classList.add('game-started-Config')
        document.getElementById('game-config').classList.add('game-started-Config')
        document.getElementById('game-config-result').classList.remove('game-started-Config')
        document.getElementById('game-result').classList.remove('game-started-Config')
        // Play Sound
        let audio
        if (winner === 'No Body :), Your Scores Are the Same!') {
            audio = drawAudio
        } else {
            audio = winAudio
        }
        audio.volume = 0.7
        audio.play()
        setTimeout(() => {
            audio.pause()
            audio.currentTime = 0
        }, 2500)
    }
}

//////////////////////////////////////////////////////////////////////

///////// Update Players Score //////////
function updateScoresDOM(playerName, winOrLose) {
    // Checks If Player Answered True Or False
    let addSub = winOrLose ? +1 : -1
    // If Add +1 Happened:
    if (addSub === 1) {
        playerScores[playerName]++
    }
    // If Add -1 Happened:
    else {
        playerMistakes[playerName]++
        if ((playerMistakes[playerName] % 2) === 0) {
            playerScores[playerName]--
        }
    }
    // Update DOM Value
    if (playerName === playerNameFirst) {
        document.querySelectorAll('.player-1-info').forEach(function (element) {
            element.lastElementChild.innerHTML = playerScores[playerName]
        })
    } else if (playerName === playerNameSecond) {
        document.querySelectorAll('.player-2-info').forEach(function (element) {
            element.lastElementChild.innerHTML = playerScores[playerName]
        })
    }
}

/////// Game Handler Function -> Everything Happened Here :) //////////

function gameHandler() {
    roundQsAnswer = updateQsDOM(questions[gameQsNums - 1])

    if (userDevice === 'PC') {
        // PC
        window.addEventListener('keyup', checkAnswer)
    } else if (userDevice === 'Mobile') {
        // Mobile
        for (let i = 2; i < 6; i++) {
            document.querySelector('#answer-box-player-1').children[i].addEventListener('click', checkAnswer)
            document.querySelector('#answer-box-player-2').children[i].addEventListener('click', checkAnswer)
        }
    }

    /////// Check Answer Function ///////
    function checkAnswer(event) {
        // PC Users Acceptable KeyBoards
        let keyBoardNumbers = ['Numpad1', 'Numpad2', 'Numpad3', 'Numpad4', 'Digit1', 'Digit2', 'Digit3', 'Digit4']

        // Needed Variables
        let answerIndex, playerAnswered, answerStatues

        // Define Index Of Answer In DOM For Mobile Users --> 1 - 4
        for (let i = 2; i < 6; i++) {
            if (document.querySelector('#answer-box-player-1').children[i].firstElementChild.innerHTML === roundQsAnswer) {
                answerIndex = i - 1
            }
        }
        // Divide Pc User And Mobile
        if (event.type === 'keyup') {
            // For PC Users --> Check Who Answer First and If True Or Not!
            if (keyBoardNumbers.includes(event.code)) {
                // Disconnect Event To Not Get Anymore Answer
                window.removeEventListener('keyup', checkAnswer)
                // Who Answered | True Or Not
                playerAnswered = event.code.includes('Digit') ? playerNameFirst : playerNameSecond
                answerStatues = event.code.includes(answerIndex)

                // Show Correct Answer with Bg Green And if User Selected Wrong Answer Change Bg to Red!
                document.getElementById('answer-box-player-1').children[answerIndex + 1].classList.add('bg-emerald-400/50')
                if (!answerStatues){
                    let wrongIndex = Number(event.key) + 1
                    document.getElementById('answer-box-player-1').children[wrongIndex].classList.add('bg-rose-400/50')
                }

                
                qsTimer.pause()
                qsTimer.currentTime = 0
                updateScoresDOM(playerAnswered, answerStatues)
                clearInterval(timer)
                finishRound(playerAnswered, answerStatues, answerStatues)
            }
        } else if (event.type === 'click') {
            // For Mobile Users --> Check Who Answer First and If True Or Not!
            for (let i = 2; i < 6; i++) {
                // Disconnect Event To Not Get Anymore Answer
                document.querySelector('#answer-box-player-1').children[i].removeEventListener('click', checkAnswer)
                document.querySelector('#answer-box-player-2').children[i].removeEventListener('click', checkAnswer)
            }
            // Define Target User Have Clicked On!
            let clickedTarget = event.target.firstElementChild || event.target
            // Who Answered | True Or Not
            playerAnswered = clickedTarget.id.includes('player-1') ? playerNameFirst : playerNameSecond
            answerStatues = clickedTarget.innerHTML === roundQsAnswer

            // Show Correct Answer with Bg Green And if User Selected Wrong Answer Change Bg to Red!
            for (let i = 2; i < 6; i++){
                if (document.getElementById('answer-box-player-1').children[i].firstElementChild.innerHTML === roundQsAnswer){
                    document.getElementById('answer-box-player-1').children[i].classList.add('bg-emerald-400/50')
                    document.getElementById('answer-box-player-2').children[i].classList.add('bg-emerald-400/50')
                }
            }
            // If Incorrect Answer --> Element Bg Red
            if (!answerStatues){
                clickedTarget.parentElement.classList.add('bg-rose-400/50')
            }

            
            qsTimer.pause()
            qsTimer.currentTime = 0
            updateScoresDOM(playerAnswered, answerStatues)
            clearInterval(timer)
            finishRound(playerAnswered, answerStatues, answerStatues)
        }

    }


    // Question Timer
    qsTimer.volume = 1.5
    qsTimer.play()
    let roundTimer = 10
    let timer = setInterval(function () {
        if (roundTimer > 0) {
            roundTimer--
            document.querySelectorAll('.timer').forEach(element => {
                element.innerHTML = roundTimer.toString()
            })
        } else {
            qsTimer.pause()
            qsTimer.currentTime = 0
            window.removeEventListener('keyup', checkAnswer)
            for (let i = 2; i < 6; i++) {
                // Disconnect Event To Not Get Anymore Answer
                document.querySelector('#answer-box-player-1').children[i].removeEventListener('click', checkAnswer)
                document.querySelector('#answer-box-player-2').children[i].removeEventListener('click', checkAnswer)
            }

            // Show Correct Answer
            for (let j = 2; j < 6; j++){
                if (document.getElementById('answer-box-player-1').children[j].firstElementChild.innerHTML === roundQsAnswer){
                    document.getElementById('answer-box-player-1').children[j].classList.add('bg-emerald-400/50')
                    document.getElementById('answer-box-player-2').children[j].classList.add('bg-emerald-400/50')
                }
            }

            finishRound('Draw', 'Draw', 'Draw')
            clearInterval(timer)
        }
    }, 1000)
}

// GameHandler --> FinishGame ...
// GameHandler --> CheckAnswer --> finishGame ...




