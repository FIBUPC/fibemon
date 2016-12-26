const PIXI = require('pixi.js');

var Container = PIXI.Container;
var autoDetectRenderer = PIXI.autoDetectRenderer;

var pokeball, pokemons;
var creditsMessage;
var assig, assigMessage;
var state;

var stage = new Container();
var pokemonContainer = new Container();

var scale = 1;

var maxSpeed = -0.07;
var myView = document.getElementById('myCanvas');
myView.width  = window.innerWidth-20;
myView.height = window.innerHeight-20;
      

maxWidth = myView.width;
maxHeight = myView.height;
var renderer = autoDetectRenderer(maxWidth, maxHeight, {view: myView, transparent: true});
document.body.appendChild(renderer.view);

state = play;

setup();
requestAnimationFrame(gameLoop);

// TODO: Capture pokemon on collision when y speed is positive (going down)
// TODO: Print assig name over/under the pokemon
// TODO: Increment number of credits

// Game States
function play (ts) {
  if(this.startTime == null) this.startTime = ts;
  var dt = (ts - this.startTime)/700;
  this.startTime = ts;

  pokeball.update();
  pokemons.update(dt);

  // Change state to capture
  if(hitTestRectangle(pokemons,pokeball) && !pokeball.dragging){
    state = capture;
  }
}
function capture (ts) {
  if(this.startTime == null) this.startTime = ts;
  var dt = (ts - this.startTime)/700;
  this.startTime = ts;

  pokemons.angle = 0;
  pokemons.capture(dt)
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

  creditsMessage = createCredits();
  stage.addChild(creditsMessage);
}

function createCredits () {
  var base = 'Credits: ';
  var text =  new PIXI.Text(
      '',
      {fontFamily: 'Arial ', fontSize: '24px', fill: 'white'}
  );

  text.increaseCredits = function increaseCredits (inc) {
    this.credits += inc;
    this.text = base + this.credits;
  };

  text.reset = function () {
    this.credits = 0;
    this.increaseCredits(0);
  };

  text.reset();
  return text;
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

  // pokeball.position.set(x, y);
  pokeball.origX = x;
  pokeball.origY = y;

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

  // Basic Pokeball functions
  pokeball.update = function() {
    // Set start speed
    if (this.thrown) {
      this.interactive = false;
      this.buttonMode = false;
      this.thrown = false;
      this.inertia = true;
    }

    if(this.inertia) {
      if (this.speed.y===0) return this.reset();

      this.position.x += this.speed.x;
      this.position.y += this.speed.y;

      //Gravity strikes
      this.speed.y += 0.0981;
    }

    // Look if pokeball is out of bounds
    if (pokeball.position.y > maxHeight) pokeball.reset();
    if (pokeball.position.x > maxWidth || pokeball.position.x < 0) pokeball.reset();
  };
  pokeball.reset = function () {
    this.thrown = false;
    this.position.x = this.origX;
    this.position.y = this.origY;
    this.startTime = null;
    this.inertia=false;
    this.interactive = true;
    this.buttonMode = true;
    this.speed={
      x : 0,
      y : 0
    }
  };

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
    
    this.speed.x = (this.position.x - this.prev.x)/5;
    this.speed.y = (this.position.y - this.prev.y)/5;
    
    
  }
  function onDragMove() {
    if (!this.dragging) return;

    // Store previous position
    this.prev = {
      x: this.position.x,
      y: this.position.y
    };

    //Update position
    var newPosition = this.data.getLocalPosition(this.parent);
    this.position.x = newPosition.x;
    this.position.y = newPosition.y;
  }

  // Reset pokeball and add it to the stage
  pokeball.reset();
  stage.addChild(pokeball);
  return pokeball;
}
function createPokemon (texture) {
  var pokemon = new PIXI.Sprite(texture);
  
  pokemon.assigMessage = new PIXI.Text(
      assig,
      {fontFamily: 'Futura', fontSize: '32px', fill: 'black'}
  );
  pokemon.assigMessage.textWidth = textWidth(assig, 'Futura', '32px'); // To get the size on pixels of the text

  pokemon.update = function (dt) {
    this.angle += 0.6 * dt;
    var middle = (maxWidth / 2 - 50);
    var sinInc = Math.sin(this.angle) * middle; 
    this.position.x=middle + sinInc;
    var offsetX = (100 - pokemon.assigMessage.textWidth) / 2;
    this.assigMessage.position.set(pokemon.position.x + offsetX,
                                   pokemon.position.y - 30);
  };
  pokemon.capture = function(dt) {
    this.angle += 0.6*dt;
    var sinInc = Math.sin(this.angle) ; 
    var newScale = this.scale.x - sinInc;
    if (newScale <= 0) {
      creditsMessage.increaseCredits(6);
      pokemon.reset();
      pokeball.reset();
      state = play;
    } else {
      this.scale.set(newScale);  
    }
    
  };
  pokemon.reset = function () {
    this.angle = 0;
    this.position.set(80, 50);
    this.scale.set(1);
    assig = "IDI";
  };

  pokemon.reset();
  pokemonContainer.addChild(pokemon);
  pokemonContainer.addChild(pokemon.assigMessage);
  return pokemon;
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
