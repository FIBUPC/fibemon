const PIXI = require('pixi.js');

var Container = PIXI.Container;
var autoDetectRenderer = PIXI.autoDetectRenderer;
var loader = PIXI.loader;
var resources = PIXI.loader.resources;
var Sprite = PIXI.Sprite;
var Text = PIXI.Text;

var menuScene, gameScene, gameOverScene;
var pokemon, pokeball;
var creditsMessage, endMessage;
var state, id;

var stage = new Container();
var maxWidth = 512;
var maxHeight = 512;
var maxSpeed = -0.07;
var renderer = autoDetectRenderer(maxWidth, maxHeight);
document.body.appendChild(renderer.view);

state = play;

// Game States
function menu (ts) {

}

function play (ts) {
    pokeball.update(ts);
    pokeball.inertia(ts);
}

function end (ts) {

}


function setup () {
    var texture = PIXI.Texture.fromImage('pokeball.png');
    pokeball = createPokeball(maxWidth/2 , maxHeight-30, texture);
}

function gameLoop (ts) {
    requestAnimationFrame(gameLoop);
    state(ts);
    renderer.render(stage);
}

setup();
requestAnimationFrame(gameLoop);


function createPokeball(x, y, texture)
{
  // create our little bunny friend..
  var bunny = new PIXI.Sprite(texture);
  bunny.width = 30;
  bunny.height = 30;
  // enable the bunny to be interactive... this will allow it to respond to mouse and touch events
  bunny.interactive = true;
    // Intitalize variables
  bunny.speedX = 0.0;
  bunny.speedY = 0.0;
  bunny.difX = 0.0;
  bunny.difY = 0.0;
  bunny.thrown =false;

  // this button mode will mean the hand cursor appears when you roll over the bunny with your mouse
  bunny.buttonMode = true;
  bunny.update= function(dt) {
    if (!bunny.dragging) return;
    if (bunny.startTime==null) bunny.startTime = dt;
    bunny.delta = dt - bunny.startTime;
    bunny.speedX = bunny.difX / (bunny.delta);
    bunny.speedY = bunny.difY / (bunny.delta);


  };

  bunny.inertia = function(dt) {
    if(bunny.thrown) {
      if (bunny.speedY==0) return bunny.reset();
      bunny.speedY =(maxSpeed > bunny.speedY) ? maxSpeed : bunny.speedY;
      console.log("OLD - "+bunny.speedX + "-" + bunny.speedY);
      //console.log("throws");
      bunny.position.x = bunny.position.x + bunny.speedX*bunny.delta;
      bunny.position.y = bunny.position.y + bunny.speedY*bunny.delta;
      bunny.scale.set( bunny.scale.x- 0.0000001*bunny.delta);
      bunny.speedY = bunny.speedY + 0.000581;


      //console.log(bunny.speedX + "-" + bunny.speedY);
    }
    bunny.reset = function () {
      bunny.thrown = false;
      bunny.position.x = bunny.origX;
      bunny.position.y = bunny.origY;
    }
  };

  // center the bunny's anchor point
  bunny.anchor.set(0.5);

  // make it a bit bigger, so it's easier to grab
  bunny.scale.set(3);

  // setup events
  bunny
    // events for drag start
      .on('mousedown', onDragStart)
      .on('touchstart', onDragStart)
    // events for drag end
      .on('mouseup', onDragEnd)
      .on('mouseupoutside', onDragEnd)
      .on('touchend', onDragEnd)
      .on('touchendoutside', onDragEnd)
    // events for drag move
      .on('mousemove', onDragMove)
      .on('touchmove', onDragMove);
  // move the sprite to its designated position
  bunny.origX = x;
  bunny.origY = y;

  bunny.position.x = bunny.origX;
  bunny.position.y = bunny.origY;
  // add it to the stage
  stage.addChild(bunny);
  return bunny;
}

requestAnimationFrame( animate );

function animate(ts) {

  requestAnimationFrame(animate);

  // render the stage
  renderer.render(stage);

  pokeball.update(ts);
  pokeball.inertia(ts);


}

function onDragStart(event)
{
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
}

function onDragEnd()
{
  this.alpha = 1;

  this.dragging = false;
  this.thrown =true;

  // set the interaction data to null
  this.data = null;

  console.log(this.speedX);
  console.log(this.speedY);
  console.log(this.scale.x);
  console.log(this.scale.y);
}

function onDragMove()
{
  if (this.dragging)
  {

    var newPosition = this.data.getLocalPosition(this.parent);
    this.difX = newPosition.x - this.position.x;
    this.difY = newPosition.y - this.position.y;
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;
  }
}



