

const randNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const set_Top_Score=(score)=>{
    let topScore=0;
    const storedTopScore=localStorage.getItem('topScore')
    if (storedTopScore === null) {
        localStorage.setItem('topScore', 0)
    } else {
        topScore = Number(storedTopScore)
    }

  
     return topScore
}

const collision = (element,element2) => {
    const elementRect = element.getBoundingClientRect()
    let isColliding = false
    let element2Rect = element2.getBoundingClientRect()
    if (!(elementRect.top > element2Rect.bottom || 
        elementRect.bottom < element2Rect.top || 
        elementRect.left > element2Rect.right || 
        elementRect.right < element2Rect.left)) isColliding = true
    return isColliding
}

const jump=(event,player)=>{
    const jumpAudio = document.getElementById("jumpAudio")
    if (event.code === 'Space') {
        player.classList.remove('walk')
        player.classList.add('jump')
        jumpAudio.play();
        player.addEventListener('animationend', () => {
            player.classList.remove('jump')
            player.classList.add('walk')                  
        }, { once: true })
    }
}

const calculate_Obstacle_Position = (obstacleIndex,obstacles) => {
    let obstacleRightPos = Array(Array.from(obstacles).length).fill(0)
    let position;
    let isUnique;
    do {
        position = randNumber(-200, -5) - 10;
        isUnique = obstacleRightPos.every((el, i) => i === obstacleIndex || Math.abs(position - el) >= 40)
    } while (!isUnique);
    return position;
}

const move_Obstacles = (obstacles) => {
    let isColliding = false
    Array.from(obstacles).forEach((obstacle, idx) => {
        let position= parseFloat(obstacle.style.right)     
        if (isNaN(position)) {
            obstacle.style.right=`${calculate_Obstacle_Position(idx,obstacles)}%` ;
        }
        if (position > 105) obstacle.style.right = `${calculate_Obstacle_Position(idx,obstacles)}%`
        else obstacle.style.right = `${position + 0.5}%`
        if (collision(player,obstacle)) {
            isColliding = true
        } 
    });
    return isColliding
}

const game = () => {
    let startGame = false;
    document.addEventListener('keydown', (event)=>{startGame&&jump(event,player)})
    let startTime = Date.now();
    let currentScore = 0;
    let extraPoints = 0;
    let topScore = set_Top_Score();              
    const menu = document.getElementById('menu');
    const startButton = document.getElementById('start');
    const gameContainer=document.getElementById('game')
    const hole=document.getElementById('hole')
    const holeContainer=document.getElementById('hole-container')
    const player = document.getElementById('player')
    const score = document.getElementById('score')
    const topScoreElement = document.getElementsByClassName('top-score')
    Array.from(topScoreElement).forEach((element)=>{
        element.textContent=`Top score: ${topScore}`
    })
    const obstacles = document.getElementsByClassName('obstacle')
    const deadAudio=document.getElementById("deadAudio")
    
    const reset_Game_State = () => {
        currentScore = 0;
        extraPoints = 0;
        Array.from(obstacles).forEach(obstacle => {
            obstacle.style.right = `${randNumber(-200, -5)-10}%`
        })
    }

    const game_Over=()=>{
        holeContainer.style.visibility='visible'
        hole.classList.add('shrink')
        player.classList.add('dead')
        jumpAudio.pause()
        deadAudio.play()
        hole.addEventListener('animationend', () => {
            hole.classList.remove('shrink')
            player.classList.remove('dead')
            player.classList.add('walk')
            gameContainer.style.visibility = 'hidden'
            if(topScore < currentScore){
                topScore = currentScore
                localStorage.setItem('topScore', currentScore)
                topScoreElement.textContent=`Top score: ${topScore}`
            }
            reset_Game_State();
            Array.from(topScoreElement).forEach((element)=>{
                element.textContent=`Top score: ${topScore}`
            })
            startGame = false
            menu.style.display='flex'

        }, { once: true })
    }
 
    const animate = () => {
        currentScore = Date.now() - startTime + extraPoints;
        if (!move_Obstacles(obstacles) && startGame) {
            score.textContent = `Score: ${currentScore}`
            
            requestAnimationFrame(animate)
        } else {
            game_Over();
        }
    };

    startButton.addEventListener('click', () => {
        startGame = true
        startTime = Date.now()
        startGame && (menu.style.display = 'none') && (gameContainer.style.visibility = 'visible') && (holeContainer.style.visibility = 'visible') && animate()
    })
}

document.addEventListener("DOMContentLoaded",game())