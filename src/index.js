const PIXI = require('pixi.js');

var Container = PIXI.Container;
var autoDetectRenderer = PIXI.autoDetectRenderer;

var pokeball, pokemons;
var credits, creditsMessage;
var assig, assigMessage;
var state;

var stage = new Container();
var pokemonContainer = new Container();

var maxWidth = 512;
var maxHeight = 512;
var maxSpeed = -0.07;
var myView = document.getElementById('myCanvas');
var renderer = autoDetectRenderer(maxWidth, maxHeight, {view: myView, transparent: true});
document.body.appendChild(renderer.view);

state = play;

setup();
requestAnimationFrame(gameLoop);

// TODO: Capture pokemon on collision when y speed is positive (going down)
// TODO: Print assig name over/under the pokemon
// TODO: Increment number of credits

// Game States
function menu (ts) {

}
function play (ts) {
    pokeball.update(ts);
    pokeball.inertia(ts);
    
    if(this.startTime == null) this.startTime = ts;
    var dt = (ts - this.startTime)/700;
    this.startTime = ts;

    pokemons.update(dt);

    if (pokeball.position.y > maxHeight) pokeball.reset();
    if (pokeball.position.x > maxWidth || pokeball.position.x < 0) pokeball.reset();

    setCreditsMessage(); // Updates automatically the credits message. credits var need to be updated
}
function end (ts) {

}

// Game Setup
function setup () {
  assig = "IDI";
  stage.addChild(pokemonContainer);

  var pokemonTexture = PIXI.Texture.fromImage('pokemons.png');
  pokemonTexture.frame = new PIXI.Rectangle(0, 0, 100, 100);
  pokemons = createPokemon(pokemonTexture);

  var pokeballTexture = PIXI.Texture.fromImage('pokeball.png');
  pokeball = createPokeball(pokeballTexture);

  credits = 0;
  setCreditsMessage();
  stage.addChild(creditsMessage);
}
function createPokeball(texture) {
  pokeball = new PIXI.Sprite(texture);

  // Initialize variables
  var x = maxWidth / 2;
  var y = maxHeight - 30;

  pokeball.width = 30;
  pokeball.height = 30;
  pokeball.interactive = true;
  pokeball.buttonMode = true;
  pokeball.anchor.set(0.5);

  pokeball.position.set(x, y);
  pokeball.origX = x;
  pokeball.origY = y;
  pokeball.speedX = 0.0;
  pokeball.speedY = 0.0;
  pokeball.difX = 0.0;
  pokeball.difY = 0.0;
  pokeball.thrown = false;

  pokeball.update = function(dt) {
    if (!pokeball.dragging) return;
    if (pokeball.startTime==null) pokeball.startTime = dt;
    pokeball.delta = dt - pokeball.startTime;
    pokeball.speedX = pokeball.difX / (pokeball.delta);
    pokeball.speedY = pokeball.difY / (pokeball.delta);
  };
  pokeball.inertia = function(dt) {
    if(pokeball.thrown) {
      if (pokeball.speedY==0) return pokeball.reset();
      pokeball.speedY =(maxSpeed > pokeball.speedY) ? maxSpeed : pokeball.speedY;
      pokeball.position.x = pokeball.position.x + pokeball.speedX*pokeball.delta;
      pokeball.position.y = pokeball.position.y + pokeball.speedY*pokeball.delta;
      // TODO: Im sorry bro, this doesnt work properly and fks the pokeball later 
      // I know. -.-
      //pokeball.scale.set( pokeball.scale.x- 0.0000001*pokeball.delta);
      pokeball.speedY = pokeball.speedY + 0.000581;
    }
  };
  pokeball.reset = function () {
    pokeball.thrown = false;
    pokeball.position.x = pokeball.origX;
    pokeball.position.y = pokeball.origY;
    pokeball.startTime = null;
  };

  // Events Setup
  pokeball
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

  // add it to the stage
  stage.addChild(pokeball);
  return pokeball;
}
function createPokemon (texture) {
  var pokemon = new PIXI.Sprite(texture);
  pokemon.angle = 0;
  pokemon.position.set(50, 50);
  pokemon.assigMessage = new PIXI.Text(
      assig,
      {fontFamily: 'Futura', fontSize: '32px', fill: 'black'}
  );
  pokemon.assigMessage.textWidth = textWidth('Credits: 0', 'Futura', '32px'); // To get the size on pixels of the text
  pokemon.update = function (dt) {
    this.angle += 0.6*dt;
    var middle = (maxWidth / 2 - 50);
    var sinInc = Math.sin(this.angle) * middle; 
    this.position.x=middle + sinInc;
    this.assigMessage.position.set(pokemon.position.x + 15,
                                   pokemon.position.y - 30);
  };
  pokemonContainer.addChild(pokemon);
  pokemonContainer.addChild(pokemon.assigMessage);
  return pokemon;
}
function setCreditsMessage () {
  creditsMessage = new PIXI.Text(
      'Credits: ' + credits,
      {fontFamily: 'Futura', fontSize: '24px', fill: 'black'}
  );
}

// Game Loop
function gameLoop (ts) {
    requestAnimationFrame(gameLoop);
    state(ts);
    renderer.render(stage);
}

// Collision Method
function hitTestRectangle (sprite1, sprite2) {
  // Define the letiables we'll need to calculate
  var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  // hit will determine whether there's a collision
  hit = false;
  // Find the center points of each sprite
  sprite1.centerX = sprite1.x + sprite1.width / 2;
  sprite1.centerY = sprite1.y + sprite1.height / 2;
  sprite2.centerX = sprite2.x + sprite2.width / 2;
  sprite2.centerY = sprite2.y + sprite2.height / 2;
  // Find the half-widths and half-heights of each sprite
  sprite1.halfWidth = sprite1.width / 2;
  sprite1.halfHeight = sprite1.height / 2;
  sprite2.halfWidth = sprite2.width / 2;
  sprite2.halfHeight = sprite2.height / 2;
  // Calculate the distance vector between the sprites
  vx = sprite1.centerX - sprite2.centerX;
  vy = sprite1.centerY - sprite2.centerY;
  // Figure out the combined half-widths and half-heights
  combinedHalfWidths = sprite1.halfWidth + sprite2.halfWidth;
  combinedHalfHeights = sprite1.halfHeight + sprite2.halfHeight;
  // Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    // A collision might be occuring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      // There's definitely a collision happening
      hit = true
    } else {
      // There's no collision on the y axis
      hit = false
    }
  } else {
    // There's no collision on the x axis
    hit = false
  }
  // `hit` will be either `true` or `false`
  return hit
}

// Callback Functions
function onDragStart(event) {
  // store a reference to the data
  // the reason for this is because of multitouch
  // we want to track the movement of this particular touch
  this.data = event.data;
  this.alpha = 0.5;
  this.dragging = true;
}
function onDragEnd() {
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
function onDragMove() {
  if (this.dragging) {
    var newPosition = this.data.getLocalPosition(this.parent);
    this.difX = newPosition.x - this.position.x;
    this.difY = newPosition.y - this.position.y;
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;
  }
}

// Others
function textWidth (txt, fontname, fontsize) {
  this.e = document.createElement('span')
  this.e.style.fontSize = fontsize
  this.e.style.fontFamily = fontname
  this.e.innerHTML = txt
  document.body.appendChild(this.e)
  let w = this.e.offsetWidth
  document.body.removeChild(this.e)
  return w
}