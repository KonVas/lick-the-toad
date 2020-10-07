let input,
    button,
    greeting,
    data,
    socket,
    ball,
    user,
    balls = [];


function setup() {
    background(0);
    createCanvas(400, 600);
    input = createInput();
    input.position(10, 610);
    button = createButton('submit');
    button.position(input.x+135, input.y+1 );
    button.mousePressed(greet);
    greeting = createElement('h2', 'what is your name?');
    greeting.position(button.x-135,  button.y);
    textAlign(CENTER);
    textSize(50);

    socket = io.connect('http://127.0.0.1:8000/')

    ball = new Ball(random(width), random(height), random(20, 25));

    data = {
        x: ball.pos.x,
        y: ball.pos.y,
        r: ball.r
    };

    socket.emit('start', data);

    socket.on('heartbeat', (data) => {balls = data});
    
}


function greet() {
    const name = input.value();
    greeting.html('hello ' + name + '!');
    input.value('');
}

function draw() {
    
    background(0);
    ball.display();
    ball.constrain();

    for (let i =  balls.length -1; i >= 0; i--) {
        let id = balls[i].id;
        if (id.substring(2, id.length) !== socket.id) {
            fill('teal');
            ellipse(balls[i].x, balls[i].y, balls[i].r*2, balls[i].r*2);
            fill('grey');
            textAlign(CENTER);
            textSize(6);
            text(balls[i].id, balls[i].x, balls[i].y, balls[i].r);
        }
    };

    if(mouseIsPressed == true) {

        color = 155;
        ball.update();

        data = {
            x: ball.pos.x,
            y: ball.pos.y,
            r: ball.r
        };

        socket.emit('update', data);

    } else {
    //    color = 255;
    }
}
