
const get_Random_Number = (min, max) => {
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
    let startGame=false
    let startTime = Date.now()
    let topScore=0
    const startButton = document.getElementById('start')
   
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
    let collisionText=document.getElementById('collisionText')
    let obstacles = document.getElementsByClassName('obstacle')

    //set the text in the top score element to the top score
    topScoreElement.textContent=`Top score: ${topScore}`
    // an event listener to listen for the press of the space bar and add the class name of "jump"
    // to the player to trigger the keyframe animation
    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space'&&startGame) {
            // add the css class to the element 
            player.classList.add('jump')
            //listents for the end of the animation
            player.addEventListener('animationend', () => {
                // removes the class
                player.classList.remove('jump')
                update_Player_Coordinates()
            }, { once: true })//only triggers once, then the listener is removed untill space is pressed again
        }
    })

    const collision=(element)=>{
        //get the bounding quadrilateral of the player element
        let playerRect = player.getBoundingClientRect()
        let isColliding=false
        //get the bounding quadrilateral of the obstacle element 
        let elementRect = element.getBoundingClientRect()
        //some simple math to check the position of both and check if they overlap
        if (!(playerRect.top > elementRect.bottom || 
            playerRect.bottom < elementRect.top || 
            playerRect.left > elementRect.right || 
            playerRect.right < elementRect.left)) isColliding = true
        //we can handle the collision detection here
        if(isColliding) collisionText.textContent='true'
        else collisionText.textContent='false'
        return isColliding
    }
    //this function now returns a bool indicating a collision
    const move_Obstacles=()=>{
        let isColliding=false
        //turn the HTMLCollectionOf<Element> to an array and loop through
        Array.from(obstacles).forEach(obstacle => {
            //check if there is a right property in its style and retrive it
            console.log(parseInt(obstacle.style.right))
            let currentRight = parseInt(obstacle.style.right)
            //if is a nan set it to a random number
            if (isNaN(currentRight)) {
                currentRight = get_Random_Number(-200, -5)-10
            }
            //check if the obstacle is off the screen, if so
            //set it back to starting position
            if(currentRight>105) obstacle.style.right=`${get_Random_Number(-200, -5)-10}%`
            //else increment by 1%
            else obstacle.style.right = `${currentRight+1}%`
            //check if the object is colliding with the player
            if(collision(obstacle)){
                isColliding=true
            }
        })
        return isColliding
    }
    const reset_Game_State=()=>{
        Array.from(obstacles).forEach(obstacle => {
            obstacle.style.right=`${get_Random_Number(-200, -5)-10}%`
        })
         
    }
    //main animation function 
    const animate = () => {
        let currentScore=Date.now()-startTime
        if (!move_Obstacles()&&startGame) {
            score.textContent=`Score: ${currentScore}`
          
            requestAnimationFrame(animate)
        } else {
            startButton.style.display='block'
            if(topScore<currentScore){
                topScore=currentScore
                localStorage.setItem('topScore', currentScore)
                topScoreElement.textContent=`Top score: ${topScore}`
            }
           
            console.log('Collision detected. Game Over.')
            reset_Game_State()
            startGame=false
        }
    }
    startButton.addEventListener('click',()=>{
        startGame=true
        startTime=Date.now()
        startGame&&(startButton.style.display='none')&&animate()
    })
    
   
}

game()
