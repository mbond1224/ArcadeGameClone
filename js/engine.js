/* jshint -W097 */
'use strict';
/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */
//import {resources} from './resources.es6.js';



/**
 *@description The game engine class , manages the game  
 * 
 */

class Engine {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    constructor() {
        
        Engine.HEIGHT_ROW = 83; // Image Dimension
        Engine.WIDTH_COL = 101; // Image Dimension
        Engine.MAX_STAGES = 5;
        Engine.COLLISION_MARGIN = 75;

        this.cols = 8;
        this.rows = 7;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = null;
        this.moves = 0;
        this.startTime = 0;
        this.stage = 1;
        this.score = 0;
        this.canvas.width = Engine.WIDTH_COL * this.cols;
        this.canvas.height = Engine.HEIGHT_ROW * this.rows;
        document.body.appendChild(this.canvas);
        this.resources = Resources.getInstance();
        this.pauseButton = document.querySelector('.fas.fa-pause');
        this.player = null;
        this.allEnemies = [];
        this.cleanState = true;
        this.loadImages();
        this.gameOn = true;
        this.rowImages = [];
        this.resources.onReady(this.init.bind(this));
    }

    /***
 * @description Prepopulate the objects used in rendering for efficiency
 */

    populateRowImages() {
       
        let row,rowImages = [];
        rowImages[0] = this.resources.get('water-block.png');
        for (row = 1; row < this.rows - 2; row++) {
            rowImages[row] = this.resources.get('stone-block.png');
        }
        for (; row < this.rows; row++) {
            rowImages[row] = this.resources.get('grass-block.png');
               }
        this.rowImages = rowImages;
       
    }

    /***
 * @description Render the textual info after stage completion
 */
    renderInfo() {
       document.querySelector('.stage').textContent = '1-' + this.stage;
       document.querySelector('.score').textContent = this.score;
    }
    /***
 * @description Retuns rows in canvas grid
 */

    getRowCount() {
        return this.rows;
    }

    /***
 * @description Retuns columns in canvas grid
 */
    getColWidth() {
        return Engine.WIDTH_COL;
    }

    /***
 * @description Retuns row height in canvas grid
 */
    getrowHeight() {
        return Engine.HEIGHT_ROW;
    }
    /***
 * @description Retuns the right end X cordinates of canvas grid
 */

    getXEnd() {
        return this.canvas.width;
    }
    /***
 * @description Retuns the bottom end Y cordinates of canvas grid
 */
    getYEnd() {
        return this.canvas.height;
    }
    /***
 * @description Utility method for debugging , all logging can be turned off single variable
 */

    log(...stmts) {
        this
            .resources
            .log(stmts);
    }
    /**
     * @description change the time on panel
     * @param {*} currentTime
     */
    setTimerVal(currentTime) {

        let minutes = Math.floor(currentTime / 60);
        let seconds = Math.floor(currentTime % 60);
        document.querySelector('.time').textContent = 
        `${String(minutes).padStart(2, 0)}: ${String(seconds).padStart(2, 0)}`;

    }



    /***
 * @description Retuns if games is still continued to be used by game entities
 */

    isGameOn() {
        return this.gameOn;
    }

    /***
 * @description set the game state , in case game entities need to set it
 */
    setGameState(fGameOn) {
        this.gameOn = fGameOn;

    }

    /*****
     *
     * @argument  player : the main player for the game engine
     * @description  Sets the player for the game
     */

    setPlayer(player) {
        this.player = player;
    }

    /*****
     * @deprecated use  addEnemy
     * @argument {}  enemies : array of enemies
     * @description  Sets the enemy array  for the game
     */

    setEnemies(enemies) {
        //   this.allEnemies = enemies;
    }
    /**
     * @description Adds an enemy to the engine for tracking
     * @param {*} enemy Enemy to be added
     */
    addEnemy(enemy) {
        this
            .allEnemies
            .push(enemy);
    }

    /****
     * @description load all the images
     */

    loadImages() {
        this
            .resources
            .load([
                'stone-block.png',
                'water-block.png',
                'grass-block.png',
                'enemy-bug.png',
                'char-boy.png',
                'char-horn-girl.png',
                'char-pink-girl.png',
                'Gem Blue.png',
                'Gem Green.png',
                'Gem Orange.png',
                'Heart.png',
                'Key.png',
                'Rock.png',
                'Selector.png',
                'Star.png'
            ]);

    }

    /***
 * @description This function serves as the kickoff point for the game loop
 * itself and handles properly calling the update and render methods.
 */

    main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        // too many calls dont enable  Engine.getInstance().log("[E79] Inside main
        // function the value of this is ",this );
        let now = Date.now();
        let dt = (now - this.lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        this.update(dt);
        if (this.player && this.allEnemies)
            this.render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        this.lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        if (this.gameOn) {
            let totalTime = now - this.startTime;
            this.setTimerVal(totalTime / 1000);
        }
       window.requestAnimationFrame(this.main.bind(this)); 
    }

    /***
     * 
     * @description This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     * 
     */


    init() {
        //this.reset();
        this.lastTime = Date.now();
        this.startTime = this.lastTime;
        this.pauseButton.addEventListener('click', (e) => {
                if (!this.cleanState)
                    this.reset(true);
                else{
                    this.gameOn = !this.gameOn;
                    this.pauseButton.classList.toggle('fa-pause');
                    this.pauseButton.classList.toggle('fa-play-circle');
                }
            });
        this.populateRowImages();
        this.main();
        // bind the pause button functionality
    }


    /***
         * @description This function is called by main (our game loop) and itself calls all
         * of the functions which may need to update entity's data. Based on how
         * you implement your collision detection (when two entities occupy the
         * same space, for instance when your character should die), you may find
         * the need to add an additional function call here. For now, we've left
         * it commented out - you may or may not want to implement this
         * functionality this way (you could just implement collision detection
         * on the entities themselves within your app.js file).
         */
    update(dt) {
        this.updateEntities(dt);
        // checkCollisions();
    }

    /**
     * @description  Check the collision between the enemy and the main player
     * @argument {}enemy  the enemey 
     * 
     */

    checkCollisions(enemy) {
        let xLow = enemy.getX() - Engine.COLLISION_MARGIN;
        let xHigh = enemy.getX() + Engine.COLLISION_MARGIN;

        let yLow = enemy.getY() - Engine.COLLISION_MARGIN;
        let yHigh = enemy.getY() + Engine.COLLISION_MARGIN;

        if (this.player.getX() < xHigh && this.player.getX() > xLow &&
            this.player.getY() < yHigh && this.player.getY() > yLow) {
            this.player.die(true); // attemp to kill the player if no body else did in same iter

        }

    }
    /***
     * @description  This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
    updateEntities(dt) {
        this.allEnemies.forEach(enemy => enemy.update(dt));
        this.player.die(false); // Make sure player is undead
        this.player.update();
    }

    /***
    * @description This function initially draws the "game level", it will then call
    * the renderEntities function. Remember, this function is called every
    * game tick (or loop of the game engine) because that's how games work -
    * they are flipbooks creating the illusion of animation but in reality
    * they are just drawing the entire screen over and over.
    */
    render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */

        // Before drawing, clear existing canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                this.ctx.drawImage(this.rowImages[row], col * Engine.WIDTH_COL, row * Engine.HEIGHT_ROW - 50);    
            }
        }

        this.renderEntities();
    }

    /***
    * @description This function is called by the render function and is called on each game
    * tick. Its purpose is to then call the render functions you have defined
    * on your enemy and player entities within app.js
    */
    renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        this.allEnemies.forEach(enemy => enemy.render());
        this.player.render();
    }

    /**
     * @description handles the stage completion. Takes care of info update
     * checks if game has completed , increases the rate bound for enemies 
     * 
     */

    handleStageFinish() {
        this.gameOn = false;
        let t = Date.now() - this.startTime;
        this.score += (this.stage + Math.max(0, 3 * this.stage - Math.trunc(t / 1000)));

        if (this.stage === Engine.MAX_STAGES) {
            this.gameOn = false;
            this.handleTerminalEvent(false);
            this.renderInfo();
            return;
        }
        Enemy.increaseRateBounds(this.stage * 5);
        this.stage++;
        this.gameOn = true;
        this.reset(false);
    }
    /**
     * @description handles the final event win / game over ,shows appropriate modal window
     * 
     */
    handleTerminalEvent(gameover = false) {
        let modal = document.getElementById('winModal');
        this.cleanState = false;

        this.pauseButton.classList.remove('fa-pause');
        this.pauseButton.classList.add('fa-play-circle');
        
        if (gameover) {
            modal.querySelector('h2').innerHTML = 
            `Ohh No! Beetle got ya <i class='fas fa-frown' aria-hidden='true'></i>`;
            modal.querySelector('.winuser').src = this.allEnemies[0].getStripedObj().src;
        } else {
            modal.querySelector('h2').innerHTML =
            `Congratulations You won <i class='far fa-thumbs-up' aria-hidden='true'></i>`;
            modal.querySelector('.winuser').src = this.player.getStripedObj().src;
        }
        modal.style.display = 'block';
        
        const closespan = document.querySelector('.close');
        closespan.addEventListener('click', (e) => modal.style.display = 'none');

        let restartBtn = modal.querySelector('.restart');
        restartBtn.addEventListener('click', (e) => {
            document.getElementById('winModal').style.display = 'none';
            this.reset(true);
        });

    }

    /***
     * @description This resets the game stats in case player want to replay
     * 
     */
    reset(fullReset) {
        // rely on late binding
        if (this.player !== null) { //  calling from the restart method
            if (fullReset) {
                this.cleanState = true;
                Enemy.setRateBounds(150, 200); 
                this.score = 0; this.stage = 1; 
                this.pauseButton.classList.add('fa-pause'); 
                this.pauseButton.classList.remove('fa-play-circle');
            }

            this.allEnemies = [];
            //this.player=null; lets spawn atleast one enemy for each row
            for (let i = 0; i < this.rows - 1; i++) 
            new Enemy();
            this.player.reset(); 
            this.gameOn = true; this.moves = 0;
            this.time = 0; 
            this.startTime = new Date(); 
            this.renderInfo();
        }
    }

    /**
    *@description Game entities will get the game instance through this method 
    *
    */

    static getInstance() {
        if (!Engine.globalEngine)
            Engine.globalEngine = new Engine();
        return Engine.globalEngine;
    }
}

//export default new Engine(); (this);