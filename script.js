
const randNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

//this is a function to show the current position of the player element and put it into the
//coordinates element as text content for debuging 
// const update_Player_Coordinates = () => {   
//     let playerRect = player.getBoundingClientRect()
//     //this is positions x= the amount of pixels the boxes left side is away from the left margin
//     //the y = the distance from the top margin to the top side of the element
//     let x = playerRect.left + window.scrollX
//     let y = playerRect.top + window.scrollY
//     coordinates.textContent = 'player X: ' + x + ', player Y: ' + y
// }
// //set the starting coordiantes
// update_Player_Coordinates()

const game = () => {
    let startGame = false;
    let startTime = Date.now();
    let currentScore = 0;
    let extraPoints = 0;
    let topScore = 0;
    let isJumping = false;              // check if the player is currently jumping
    let hasJumped = false;              // check if the player has jumped
    const menu = document.getElementById('menu');
    const startButton = document.getElementById('start');
    const gameContainer=document.getElementById('game')
    const hole=document.getElementById('hole')
    // check if the topScore exists in local storage if it doesnt create it, if it does set it to topScore
    const storedTopScore = localStorage.getItem('topScore')
    if (storedTopScore === null) {
        // Item doesn't exist, create it with default value
        localStorage.setItem('topScore', 0)
    } else {
        topScore = Number(storedTopScore)
    }

    // get the player and coordinated div DOM objects
    const player = document.getElementById('player')
    const coordinates = document.getElementById('coordinates')
    const score = document.getElementById('score')
    const topScoreElement = document.getElementById('top-score')
    const collisionText = document.getElementById('collisionText')
    const obstacles = document.getElementsByClassName('obstacle')
    const jumpAudio = document.getElementById("jumpAudio")
    const deadAudio=document.getElementById("deadAudio")
        
      
    //set the text in the top score element to the top score
    topScoreElement.textContent = `Top score: ${topScore}`
    // an event listener to listen for the press of the space bar and add the class name of "jump"
    // to the player to trigger the keyframe animation
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && startGame) {
            // add the css class to the element 
            player.classList.remove('walk')
            player.classList.add('jump')
            isJumping = true
            jumpAudio.play();

            //listents for the end of the animation
            player.addEventListener('animationend', () => {
                // removes the class
                player.classList.remove('jump')
                player.classList.add('walk')
                isJumping = false                   // i have an idea to give the player extra score if they jump over an obstacle
                if (hasJumped) {                    // there could be a better way to implement this
                    extraPoints += 1000             // TODO: revamp the extra points system
                    hasJumped = false               
                }
                // update_Player_Coordinates()
            }, { once: true })//only triggers once, then the listener is removed untill space is pressed again
        }
    })

    const collision = (element) => {
        //get the bounding quadrilateral of the player element
        const playerRect = player.getBoundingClientRect()
        let isColliding = false
        //get the bounding quadrilateral of the obstacle element 
        let elementRect = element.getBoundingClientRect()
        //some simple math to check the position of both and check if they overlap
        if (!(playerRect.top > elementRect.bottom || 
            playerRect.bottom < elementRect.top || 
            playerRect.left > elementRect.right || 
            playerRect.right < elementRect.left)) isColliding = true
            
       
        return isColliding
    }

    // calculate each obstacle positions to prevent two obstacles from being too close to each other making the game impossible
    // needs more testing, but so far so good
    let obstacleRightPos = Array(Array.from(obstacles).length).fill(0)
    const calculate_Obstacle_Position = (obstacleIndex) => {
        let position;
        let isUnique;
        do {
            position = randNumber(-200, -5) - 10;
            isUnique = obstacleRightPos.every((el, i) => i === obstacleIndex || Math.abs(position - el) >= 40);
        } while (!isUnique);
        return position;
    }

    //this function now returns a bool indicating a collision
    const move_Obstacles = () => {
        let isColliding = false
        console.log(`distance between obstacles: ${Math.abs(obstacleRightPos[0] - obstacleRightPos[1])}`)

        //turn the HTMLCollectionOf<Element> to an array and loop through
        Array.from(obstacles).forEach((obstacle, idx) => {
            // modify the currentRight to use obstacle array positions
            obstacleRightPos[idx] = parseFloat(obstacle.style.right)     // i modify the position to use float in order for it to move more smoothly
            if (isNaN(obstacleRightPos[idx])) {
                obstacleRightPos[idx] = calculate_Obstacle_Position(idx);
            }

            //check if the obstacle is off the screen, if so set it back to starting position
            if (obstacleRightPos[idx] > 105) obstacle.style.right = `${calculate_Obstacle_Position(idx)}%`
            else obstacle.style.right = `${obstacleRightPos[idx] + 0.5}%`    // i also set this to 0.5% to make it move slower
                
            //check if the object is colliding with the player
            if (collision(obstacle)) {
                isColliding = true
               
            } else if (isJumping && !hasJumped) {
                let playerRect = player.getBoundingClientRect()
                let obstacleRect = obstacle.getBoundingClientRect()

                // only treat the player as having jumped if the player has jumped over the obstacle without colliding
                if (playerRect.right > obstacleRect.left && !collision(obstacle)) hasJumped = true
            }
        });

        return isColliding
    }

    const reset_Game_State = () => {
        currentScore = 0;
        extraPoints = 0;
        Array.from(obstacles).forEach(obstacle => {
            obstacle.style.right = `${randNumber(-200, -5)-10}%`
        })
    }

    //main animation function 
    const animate = () => {
        currentScore = Date.now() - startTime + extraPoints;

        // TODO: maybe implement extra points when the user jumps over an obstacle?
        // i dont know how to implement this - Akip

        if (!move_Obstacles() && startGame) {
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

    startButton.addEventListener('click', () => {
        startGame = true
        startTime = Date.now()
        startGame && (menu.style.display = 'none') && (gameContainer.style.visibility = 'visible')&&animate()
    })
}

game()
