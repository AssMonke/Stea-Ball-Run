const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = "600"
canvas.height = "600"

const renderRate = 25;

const moveSpeed = 5;
const gunRotateSpeed = 0.1;
const gunRotateOffset = 10;
const gunSize = 20;
const bulletSpeed = 0.2;
const playerSize = 40;

var player1 = new Rect(100, 280, playerSize, playerSize, "red");
var player1Gun = new Rect(160, 320, gunSize, gunSize, "white");
var g1T = 0;
var fire1 = false;
var flag1 = new Circle(50, 300, 20, "red");
var scoreBound1 = new Rect(100, 0, 10, canvas.height, "purple");

var player2 = new Rect(460, 280, playerSize, playerSize, "blue");
var player2Gun = new Rect(440, 320, gunSize, gunSize, "white");
var g2T = 408;
var fire2 = false;
var flag2 = new Circle(550, 300, 20, "blue");
var scoreBound2 = new Rect(500, 0, 10, canvas.height, "purple");

var bullets = [];
var particles = [];
var isGameOver = false;
var input = [];
var handleInput = (event) => { input[event.keyCode] = event.type == 'keydown'; }
document.addEventListener('keydown', handleInput);
document.addEventListener('keyup', handleInput);

var test = new ParticleExplosion(12, new Circle(300, 300, 5, "blue"), 2);

function Render()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear

    scoreBound1.update();
    scoreBound2.update();
    player1.update();
    player1Gun.update();
    player2.update();
    player2Gun.update();
    flag1.update();
    flag2.update();

    let l = particles.length;
    for(let i = 0; i < l; i++){ particles[i].update(); }

    if(player1.x < 50 && flag2.isPickedUp){ EndGame("Player 1 Wins!"); }
    else if(player2.x > 500 && flag1.isPickedUp){ EndGame("Player 2 Wins!"); }

    if(flag1.isPickedUp){ flag1.x = player2.x; flag1.y = player2.y+playerSize; }
    if(flag2.isPickedUp){ flag2.x = player1.x+playerSize; flag2.y = player1.y+playerSize; }

    for(let i = 0; i < bullets.length; i++)
    { 
        bullets[i].update(); 

        if(CheckDistance(player1, bullets[i], playerSize/2))
        { 
            flag2.isPickedUp = false; 
            bullets.splice(i, 1); 
            particles.push(new ParticleExplosion(6, new Circle(player1.x+(playerSize/2), player1.y+(playerSize/2), 5, "red"), 3));
            setTimeout(() => { particles.shift(); }, 1500)
            player1.x = 100; 
            player1.y = 280;
        }
        else if(CheckDistance(player2, bullets[i], playerSize/2))
        { 
            flag1.isPickedUp = false; 
            bullets.splice(i, 1);
            particles.push(new ParticleExplosion(6, new Circle(player2.x+(playerSize/2), player2.y+(playerSize/2), 5, "blue"), 3));
            setTimeout(() => { particles.shift(); }, 1500) 
            player2.x = 460; 
            player2.y = 280;
        }
    }

    // movement 
    if(input[87] && player1.y > 0) { player1.y -= moveSpeed; }
    if(input[65] && player1.x > 0) { player1.x -= moveSpeed; }
    if(input[83] && player1.y < canvas.height-playerSize) { player1.y += moveSpeed; }
    if(input[68] && player1.x < canvas.width-playerSize) { player1.x += moveSpeed; }

    if(input[38] && player2.y > 0) { player2.y -= moveSpeed; }
    if(input[37] && player2.y > 0) { player2.x -= moveSpeed; }
    if(input[40] && player2.y < canvas.height-playerSize) { player2.y += moveSpeed; }
    if(input[39] && player2.x < canvas.width-playerSize) { player2.x += moveSpeed; }

    // shooting
    if(input[69]) { g1T++; fire1 = true;}
    else if(fire1) { ShootBullet(player1, player1Gun); fire1 = false; }
    player1Gun.x = (Math.cos(g1T * gunRotateSpeed) * (playerSize+gunRotateOffset)) + player1.x + (gunSize/2);
    player1Gun.y = (Math.sin(g1T * gunRotateSpeed) * (playerSize+gunRotateOffset)) + player1.y + (gunSize/2);
    
    if(input[191]) { g2T++; fire2 = true;}
    else if(fire2) { ShootBullet(player2, player2Gun); fire2 = false; }
    player2Gun.x = (Math.cos(g2T * gunRotateSpeed) * (playerSize+gunRotateOffset)) + player2.x + (gunSize/2);
    player2Gun.y = (Math.sin(g2T * gunRotateSpeed) * (playerSize+gunRotateOffset)) + player2.y + (gunSize/2);

    // picking up flag
    if(CheckDistance(player1, flag2, playerSize/2)) { flag2.isPickedUp = true; }
    else if(CheckDistance(player2, flag1, playerSize/2)) { flag1.isPickedUp = true; }
}
var updateLoop = window.setInterval(Render, renderRate);

function ShootBullet(player, gun)
{
    let bullet = new Circle(gun.x, gun.y, 5, "yellow");
    bullet.vX = (gun.x - player.x) * bulletSpeed;
    bullet.vY = (gun.y - player.y) * bulletSpeed;
    bullets.push(bullet);
    setTimeout(() => { bullets.shift(); }, 1500);
}

function CheckDistance(e1, e2, thresh)
{
    let e1X = e1.x + (e1.w/2);
    let e1Y = e1.y + (e1.h/2);
    
    let x = Math.abs(e2.x - e1X);
    let y = Math.abs(e2.y - e1Y);
    return x < thresh && y < thresh;
}

function Rect(x, y, w, h, color)
{
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;

    this.vX = 0; // Velocity
    this.vY = 0;

    this.update = function()
    {
        this.x += this.vX;
        this.y += this.vY;

        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
    
    this.copy = function() { return new Rect(x, y, w, h, color) }
}

function Circle(x, y, r, color)
{
    this.x = x;
    this.y = y;
    this.r = r;
    this.color = color;

    this.vX = 0; // Velocity
    this.vY = 0;

    this.isPickedUp = false; // specific to the flag
    
    this.update = function()
    {
        this.x += this.vX;
        this.y += this.vY;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    this.copy = function() { return new Circle(x, y, r, color) }
}

function ParticleExplosion(amount, shape, speed)
{
    this.amount = amount;
    this.shape = shape;
    this.speed = speed;
    
    this.shapes = [];

    for(let i = 0; i < this.amount; i++){
        this.shapes.push(this.shape.copy());
    }
    
    this.update = function()
    {
        let l = this.shapes.length;
        for(let i = 0; i < l; i++)
        {
            this.shapes[i].vX = Math.cos(i) * this.speed;
            this.shapes[i].vY = Math.sin(i) * this.speed;
            this.shapes[i].update();
        }
    }
}

var retryButton = {
    x:200,
    y:175,
    width:200,
    height:50
};
function EndGame(result)
{
    clearInterval(updateLoop);
    isGameOver = true;

    ctx.fillStyle = 'yellow';
    ctx.font = "30px Arial";
    ctx.fillText(result, 200, 150);

    ctx.fillRect(retryButton.x, retryButton.y, retryButton.width, retryButton.height);
    ctx.fillStyle = 'black';
    ctx.font = "50px Arial";
    ctx.fillText("Retry", 235, 215);
}

//Function to get the mouse position
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
//Function to check whether a point is inside a rectangle
function isInside(pos, rect){
    return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y
}

canvas.addEventListener('click', function(evt) {
    if(!isGameOver){ return; }
    
    var mousePos = getMousePos(canvas, evt);

    if (isInside(mousePos, retryButton)) {
        window.location.reload(true);
    }
}, false);