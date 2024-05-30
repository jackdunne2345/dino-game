
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
    let topScore = 0;
    const startButton = document.getElementById('start');
   
    // check if the topScore exists in local storage if it doesnt create it, if it does set it to topScore
    const storedTopScore = localStorage.getItem('topScore')
    if (storedTopScore === null) {
        // Item doesn't exist, create it with default value
        localStorage.setItem('topScore', 0)
    } else {
        topScore = Number(storedTopScore)
    }

    // get the player and coordinated div DOM objects
    let player = document.getElementById('player')
    let coordinates = document.getElementById('coordinates')
    let score = document.getElementById('score')
    let topScoreElement = document.getElementById('top-score')
    let collisionText = document.getElementById('collisionText')
    let obstacles = document.getElementsByClassName('obstacle')

    //set the text in the top score element to the top score
    topScoreElement.textContent = `Top score: ${topScore}`
    // an event listener to listen for the press of the space bar and add the class name of "jump"
    // to the player to trigger the keyframe animation
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space' && startGame) {
            // add the css class to the element 
            player.classList.add('jump')
            //listents for the end of the animation
            player.addEventListener('animationend', () => {
                // removes the class
                player.classList.remove('jump')
                // update_Player_Coordinates()
            }, { once: true })//only triggers once, then the listener is removed untill space is pressed again
        }
    })

    const collision = (element) => {
        //get the bounding quadrilateral of the player element
        let playerRect = player.getBoundingClientRect()
        let isColliding = false
        //get the bounding quadrilateral of the obstacle element 
        let elementRect = element.getBoundingClientRect()
        console.log(playerRect.right, elementRect.left)
        //some simple math to check the position of both and check if they overlap
        if (!(playerRect.top > elementRect.bottom || 
            playerRect.bottom < elementRect.top || 
            playerRect.left > elementRect.right || 
            playerRect.right < elementRect.left)) isColliding = true
            
        //we can handle the collision detection here
        if (isColliding) collisionText.textContent = 'true'
        else collisionText.textContent = 'false'
        return isColliding
    }

    // calculate each obstacle positions to prevent two obstacles from being too close to each other making the game impossible
    // needs more testing, but so far so good
    let obstacleRightPos = Array(Array.from(obstacles).length).fill(0);
    const calculateObstaclePositions = (obstacleIndex) => {
        let position;
        let isUnique;
        do {
            position = randNumber(-200, -5) - 10;
            isUnique = obstacleRightPos.every((el, i) => i === obstacleIndex || Math.abs(position - el) >= 40);
        } while (!isUnique);
        return position;
    }

    //this function now returns a bool indicating a collision
    const moveObstacles = () => {
        let isColliding = false
        console.log(`distance between obstacles: ${Math.abs(obstacleRightPos[0] - obstacleRightPos[1])}`)

        //turn the HTMLCollectionOf<Element> to an array and loop through
        Array.from(obstacles).forEach((obstacle, idx) => {
            //check if there is a right property in its style and retrive it
            // console.log(`obstacle ${obstacle.className}`, parseFloat(obstacle.style.right));

            // modify the currentRight to use obstacle array positions
            obstacleRightPos[idx] = parseFloat(obstacle.style.right)     // i modify the position to use float in order for it to move more smoothly
            if (isNaN(obstacleRightPos[idx])) {
                obstacleRightPos[idx] = calculateObstaclePositions(idx);
            }

            //check if the obstacle is off the screen, if so set it back to starting position
            if (obstacleRightPos[idx] > 105) obstacle.style.right = `${calculateObstaclePositions(idx)}%`
            else obstacle.style.right = `${obstacleRightPos[idx] + 0.5}%`    // i also set this to 0.5% to make it move slower
            
            //check if the object is colliding with the player
            if (collision(obstacle)) {
                isColliding = true
            }
        });

        return isColliding
    }

    const resetGameState = () => {
        Array.from(obstacles).forEach(obstacle => {
            obstacle.style.right = `${randNumber(-200, -5)-10}%`
        })
    }

    //main animation function 
    const animate = () => {
        currentScore = Date.now() - startTime
        if (!moveObstacles() && startGame) {
            score.textContent = `Score: ${currentScore}`
            requestAnimationFrame(animate)
        } else {
            startButton.style.display='block'
            if(topScore < currentScore){
                topScore = currentScore
                localStorage.setItem('topScore', currentScore)
                topScoreElement.textContent=`Top score: ${topScore}`
            }
           
            console.log('Collision detected. Game Over.')
            resetGameState();
            startGame = false
        }
    };

    startButton.addEventListener('click', () => {
        startGame = true
        startTime = Date.now()
        startGame && (startButton.style.display = 'none') && animate()
    })
}

game()
