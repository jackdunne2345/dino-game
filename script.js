
// get the player and coordinated div DOM objects
let player = document.getElementById('player')
let coordinates = document.getElementById('coordinates')
let collisionText=document.getElementById('collisionText')
let obstacle = document.getElementsByClassName('obstacle')[0]
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
        move_obstacle()
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

const move_obstacle=()=>{
    let currentRight = parseInt(obstacle.style.right) || 0
    let newRight=currentRight+20
    if(newRight>window.innerWidth) obstacle.style.right='-20px'
    else obstacle.style.right = (newRight) + 'px'
}


const collision=()=>{
    let playeRect = player.getBoundingClientRect();
    let obstacleRect = obstacle.getBoundingClientRect();
    let isColliding= !(
        playeRect.top > obstacleRect.bottom || 
        playeRect.bottom < obstacleRect.top || 
        playeRect.left > obstacleRect.right || 
        playeRect.right < obstacleRect.left
    );
    if(isColliding) collisionText.textContent='true'
    else collisionText.textContent='false'

}
const checkForCollision=setInterval(collision,16)