function Ball(x, y, r) {
    this.pos = createVector(x, y)
    this.velocity = createVector();
    this.acceleration = createVector();
    this.speed = 5;
    this.r = r;

    this.display = function() {
        //fill('teal');
       // ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2);
    };

    this.update = function() {
        let mouse = createVector(mouseX, mouseY);
        this.acceleration = p5.Vector.sub(mouse, this.pos);
        //set magnitude of acceleration
        this.acceleration.setMag(0.25);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.speed);
        this.pos.add(this.velocity);
    };

    this.constrain = function() {
        ball.pos.x = constrain(ball.pos.x, -width, width);
        ball.pos.y = constrain(ball.pos.y, -height, height);
    };
}
