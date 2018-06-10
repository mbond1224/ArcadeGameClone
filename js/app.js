/* jshint -W097 */
'use strict';
/**
 * @description this is the base class to handle the entity 
 */
class GameEntity {
    constructor(sprite, xcord, ycord) {
        this.sprite = sprite;
        this.x = xcord;
        this.y = ycord;
        this.height = null;
        this.width = null;
        this.engine = Engine.getInstance();
        this.spriteObject = null;
    }


    /**
     *** @description return x Coordinate
     */
    getX() {
        return this.x;
    }
    /**
     *** @description return y Coordinate
     */
    getY() {
        return this.y;
    }
    /**
     *** @description Render the object
     */
    getStripedObj(){
        return this.SpriteObject;
    }
    render() {
        if (!this.SpriteObject) {
            this.SpriteObject = Resources.getInstance().get(this.sprite); // Avoid going to resource cache again and again
            if (this.SpriteObject) { // Wait for object to be loaded
                this.width = this.SpriteObject.width; // store the width of sprite object
                this.height = this.SpriteObject.height; // store the height of sprite object
            }
        }
        if (this.SpriteObject) // Wait for object to be loaded
            this.engine.ctx.drawImage(this.SpriteObject, this.x, this.y);
    }
    log(...stmts) {
        this.engine.log(stmts);
    }
}

/****
@description: Class for Enemy
 */

class Enemy extends GameEntity {

    constructor() {
        super('enemy-bug.png', 0, 0);
        this.engine.addEnemy(this); // Add yourself to the enemey array managed by engine
        this.log('Enemy Constructor call');
        this.rate = Enemy.getRateBounds();
        this.resetPos();
    }

    resetPos() {

        this.x = -Math.random() * 100;
        this.y = (Math.trunc(Math.random() * (this.engine.getRowCount() - 3))) * this.engine.getrowHeight();

    }
    /**
     * we set it later through setInCremental
     * @description would give the speed randomly for the bugs
     */
    static getRateBounds() {
        return Math.trunc(Enemy.RATE_LOW + Math.random() * (Enemy.RATE_HIGH - Enemy.RATE_LOW));
    }
    /**
     * we set it later through setInCremental
     * @description set the min and max rate bugs will assume randomly
     */

    static setRateBounds(start, end) {
        Enemy.RATE_LOW = start;
        Enemy.RATE_HIGH = end;
    }
    /**
     * @description Helper method for game engine to increase the speed after stage advances
     * @param {*} increment 
     */
    static increaseRateBounds(increment) {
        Enemy.RATE_LOW += increment;
        Enemy.RATE_HIGH += increment;
    }
    /***
     * @description Update the enemy's position, required method for game
     * @param: dt, a time delta between ticks
     */
    update(dt) {
        if (!this.engine.isGameOn()) {
            // Game has ended/paused for the moment nothing to do 
            return;
        }

        this.x += this.rate * dt;
        if (this.x > this.engine.getXEnd())  // Bug has exited from right .spawn back from left
            this.resetPos();

        this.checkCollision();
    }


    /**
     *@description use a bounding box to detect the collision between current enemy and player
     */
    checkCollision() {
        this.engine.checkCollisions(this); // delegate to game engine
    }

}

/**
 * @description Class representation of player
 */
class Player extends GameEntity {
    constructor() {
        if (Player.instance)
            return Player.instance;
        super('char-boy.png', 0, 0);
        this.x = this.engine.getXEnd() / 2;
        this.y = this.engine.getYEnd() - 2 * this.engine.getrowHeight();
        this.life = 3;
        this.dead = false;
        Player.instance = this;
        this.engine.setPlayer(this); // assign myself as player to the engine

        this.init();
        this.log('Player Constructor call', this);
    }

    /**
     * Single Instance
     */
    static getInstance() {
        if (!Player.instance)
            Player.instance = new Player();
        return Player.instance;
    }
    reset() {
        this.life = 3;
        document.querySelector('.fa-heartbeat').textContent = this.life;
        this.resetPos();
    }
    /***
     * @description Player was hit set him back to original position
     */

    resetPos() {
        this.x = this.engine.getXEnd() / 2;
        this.y = this.engine.getYEnd() - this.height;
        this.dead = false;
    }

    update(dt) {
        //TODO

    }


    /**
     * 
     * @param {*} keyCode 
     * @description handles the key press by player
     */
    handleInput(keyCode) {
        if (!this.engine.isGameOn())
            return;
        //this.log('[A72] Received keystroke',keyCode);
        switch (keyCode) {
            case 'left':
                this.x -= this.engine.getColWidth() / 2;
                break;
            case 'right':
                this.x += this.engine.getColWidth() / 2;
                break;
            case 'up':
                this.y -= this.engine.getrowHeight() / 2;
                break;
            case 'down':
                this.y += this.engine.getrowHeight() / 2;
                break;
        }
        // prevents going outside the box
        if (this.x < 0)
            this.x = 0;
        else if (this.x > this.engine.getXEnd() - this.width) // Left right boundary check
            this.x = this.engine.getXEnd() - this.width;

        if (this.y <= -10) { // Upper boundary  / game win check
            this.render();
            this.engine.handleStageFinish();
            return;
        } else if (this.y > this.engine.getYEnd() - this.height) // Lower Boundary check
            this.y = this.engine.getYEnd() - this.height;



    }

    /**
     * @description render the current position of game
     */



    die(fDie) {
        if (this.dead) {
            this.dead = !fDie;
            return;
        }
        if (fDie) {

            this.dead = true;
            this.life--;
            if (this.life === -1) { //game over
                this.engine.setGameState(false);
                this.y = -500;
                this.engine.handleTerminalEvent(true);
            } else {
                document.querySelector('.fa-heartbeat').textContent = this.life;
            }
            this.resetPos();
        }
    }

    // This listens for key presses and sends the keys to your
    // Player.handleInput() method. You don't need to modify this.
    /**
     * @description initialize Key Mapping
     */

    init() {
        document.addEventListener('keyup', function (e) {
            var allowedKeys = {
                37: 'left',
                38: 'up',
                39: 'right',
                40: 'down'
            };

            Player.getInstance().handleInput(allowedKeys[e.keyCode]);
        });
        document.querySelector('.fa-heartbeat').textContent = this.life;
    }



}
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

Enemy.setRateBounds(150, 200);
for(let i=0;i<Engine.getInstance().getRowCount()-1;i++)
            new Enemy();
new Player();