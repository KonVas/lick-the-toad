let input,
    button,
    greeting,
    data,
    socket,
    ball,
    balls = [];

function setup() {
    background(0);
    createCanvas(displayWidth, displayHeight);
    textAlign(CENTER);
    textSize(50);

    socket = io.connect('http://192.168.1.104:8000/')

    ball = new Ball(random(innerWidth), random(innerHeight), random(10, 24));

    data = {
        x: ball.pos.x,
        y: ball.pos.y,
        r: ball.r
    };

    socket.emit('start', data)

    socket.on('heartbeat', (data) => {balls = data})
}

function draw() {
    
    background(0)
    ball.display()
    ball.constrain()

    for (let i =  balls.length -1; i >= 0; i--) {
        let id = balls[i].id
        if (id.substring(2, id.length) !== socket.id) { //now socket.id == username coming from server, and front end.
            if(id !== ' '){
            fill('teal')
            noStroke()
            ellipse(balls[i].x, balls[i].y, balls[i].r*2, balls[i].r*2);
            textAlign(CENTER);
            fill('grey')
            noStroke()
            textSize(15)
            text(id, balls[i].x, balls[i].y + 15, balls[i].r)
            }
        }
    }

    text("ID: " + socket.id, 135, 25)
    text(["X: " + ball.pos.x / width + "\n" + "Y: "+ ball.pos.y / height], 30 + 100, 50)

    if(mouseIsPressed == true) {
        ball.update()
        data = {
            x: ball.pos.x,
            y: ball.pos.y,
            r: ball.r
        }
        socket.emit('update', data)
    } else {
    }

}
