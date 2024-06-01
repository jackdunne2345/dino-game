
let isJumping = false;              
let hasJumped = false;

const randNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const set_Top_Score=()=>{
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
        isJumping = true
        jumpAudio.play();
        player.addEventListener('animationend', () => {
            player.classList.remove('jump')
            player.classList.add('walk')                  
        }, { once: true })
    }
}

const game_Over_Screen=()=>{

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
    console.log(`distance between obstacles: ${Math.abs(obstacleRightPos[0] - obstacleRightPos[1])}`)
    Array.from(obstacles).forEach((obstacle, idx) => {
        obstacleRightPos[idx] = parseFloat(obstacle.style.right)     
        if (isNaN(obstacleRightPos[idx])) {
            obstacleRightPos[idx] = calculate_Obstacle_Position(idx,obstacles);
        }
        if (obstacleRightPos[idx] > 105) obstacle.style.right = `${calculate_Obstacle_Position(idx,obstacles)}%`
        else obstacle.style.right = `${obstacleRightPos[idx] + 0.5}%`
        if (collision(player,obstacle)) {
            isColliding = true
        } else if (isJumping && !hasJumped) {
            let elementRect = player.getBoundingClientRect()
            let obstacleRect = obstacle.getBoundingClientRect()
            if (elementRect.right > obstacleRect.left && !collision(obstacle)) hasJumped = true
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
    const player = document.getElementById('player')
    const score = document.getElementById('score')
    const topScoreElement = document.getElementById('top-score')
    const obstacles = document.getElementsByClassName('obstacle')
    const deadAudio=document.getElementById("deadAudio")
    topScoreElement.textContent = `Top score: ${topScore}`
   
    startButton.addEventListener('click', () => {
        startGame = true
        startTime = Date.now()
        startGame && (menu.style.display = 'none') && (gameContainer.style.visibility = 'visible') && animate()
    })


    const reset_Game_State = () => {
        currentScore = 0;
        extraPoints = 0;
        Array.from(obstacles).forEach(obstacle => {
            obstacle.style.right = `${randNumber(-200, -5)-10}%`
        })
    }
 
    const animate = () => {
        currentScore = Date.now() - startTime + extraPoints;
        if (!move_Obstacles(obstacles) && startGame) {
            score.textContent = `Score: ${currentScore}`
            requestAnimationFrame(animate)
        } else {
            hole.classList.add('shrink')
            player.classList.add('dead')
            jumpAudio.pause()
            deadAudio.play()
            hole.addEventListener('animationend', () => {
                hole.classList.remove('shrink')
                player.classList.remove('dead')
                player.classList.add('walk')
                menu.style.display='flex'
                gameContainer.style.visibility = 'hidden'
                if(topScore < currentScore){
                    topScore = currentScore
                    localStorage.setItem('topScore', currentScore)
                    topScoreElement.textContent=`Top score: ${topScore}`
                }
               
                console.log('Collision detected. Game Over.')
                reset_Game_State();
                startGame = false
            }, { once: true })
          
        }
    };

}

game()
