
// get the player and coordinated div DOM objects
let player = document.getElementById('player')
let coordinates = document.getElementById('coordinates')
let collisionText=document.getElementById('collisionText')
let obstacles = document.getElementsByClassName('obstacle')
//this is a function to show the current position of the player element and put it into the
//coordinates element as text content for debuging 
const update_Player_Coordinates = () => {   
    let playerRect = player.getBoundingClientRect()
    //this is positions x= the amount of pixels the boxes left side is away from the left margin
    //the y = the distance from the top margin to the top side of the element
    let x = playerRect.left + window.scrollX
    let y = playerRect.top + window.scrollY
    coordinates.textContent = 'player X: ' + x + ', player Y: ' + y
}
//set the starting coordiantes
update_Player_Coordinates()

// an event listener to listen for the press of the space bar and add the class name of "jump"
// to the player to trigger the keyframe animation
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        // add the css class to the element 
        player.classList.add('jump')
        //will trigger the call back function update_Player_Coordinates every 50milliseconds
        const interval = setInterval(update_Player_Coordinates, 50)
        //listents for the end of the animation
        player.addEventListener('animationend', () => {
            // removes the class
            player.classList.remove('jump')
            //stops the call back
            clearInterval(interval)
            //one last update
            update_Player_Coordinates()
        }, { once: true })//only triggers once then it is removed untill space is pressed again
    }
});

const move_obstacles=()=>{
    //turn the HTMLCollectionOf<Element> to an array and loop through
    Array.from(obstacles).forEach(obstacle => {
        //check if there is a right property in its style and retrive it
        //if not set it to zer0
        let currentRight = parseInt(obstacle.style.right) || 0
        //check if the obstacle is off the screen, if so
        //set it back to starting position
        if(currentRight>105) obstacle.style.right='-5%'
        //else increment by 1%
        else obstacle.style.right = (currentRight+1) + '%'
    });
}


const collision=()=>{
    //get the bounding quadrilateral of the player element
    let playeRect = player.getBoundingClientRect();
    // turn into an array and loop
    Array.from(obstacles).forEach(obstacle => {
        //get the bounding quadrilateral of the obstacle element
        let obstacleRect = obstacle.getBoundingClientRect();
        //some simple math to check the position of both and check if they overlap
        let isColliding= !(
            playeRect.top > obstacleRect.bottom || 
            playeRect.bottom < obstacleRect.top || 
            playeRect.left > obstacleRect.right || 
            playeRect.right < obstacleRect.left
        );
        //we can handle the collision detection here
        if(isColliding) collisionText.textContent='true'
        else collisionText.textContent='false'
    });
}

const game =()=>{
    collision()
    move_obstacles()
}


const go = setInterval(game, 16)