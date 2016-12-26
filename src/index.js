const PIXI = require('pixi.js');

var Container = PIXI.Container;
var autoDetectRenderer = PIXI.autoDetectRenderer;
var Texture = PIXI.Texture;

var pokeball, pokemons;
var pokemonBaseTexture, pokeballTexture;
var pokemonsTextures = [];
var creditsMessage;
var assigsText = '[{"id": "IC", "credits": 7.5}, {"id": "FM", "credits": 7.5}, {"id": "PRO1", "credits": 7.5}, {"id": "F", "credits": 7.5}, {"id": "PRO2", "credits": 7.5}, {"id": "EC", "credits": 7.5}, {"id": "M1", "credits": 7.5}, {"id": "M2", "credits": 7.5}, {"id": "PE", "credits": 6.0}, {"id": "SO", "credits": 6.0}, {"id": "CI", "credits": 6.0}, {"id": "BD", "credits": 6.0}, {"id": "EDA", "credits": 6.0}, {"id": "PROP", "credits": 6.0}, {"id": "EEE", "credits": 6.0}, {"id": "XC", "credits": 6.0}, {"id": "IES", "credits": 6.0}, {"id": "AC", "credits": 6.0}, {"id": "GPS", "credits": 6.0}, {"id": "LI", "credits": 6.0}, {"id": "SO2", "credits": 6.0}, {"id": "AC2", "credits": 6.0}, {"id": "TC", "credits": 6.0}, {"id": "SIO", "credits": 6.0}, {"id": "DSBM", "credits": 6.0}, {"id": "DSI", "credits": 6.0}, {"id": "CSI", "credits": 6.0}, {"id": "IO", "credits": 6.0}, {"id": "TXC", "credits": 6.0}, {"id": "XC2", "credits": 6.0}, {"id": "CAP", "credits": 6.0}, {"id": "PAR", "credits": 6.0}, {"id": "IA", "credits": 6.0}, {"id": "A", "credits": 6.0}, {"id": "AS", "credits": 6.0}, {"id": "PDS", "credits": 6.0}, {"id": "ER", "credits": 6.0}, {"id": "DBD", "credits": 6.0}, {"id": "IDI", "credits": 6.0}, {"id": "ADEI", "credits": 6.0}, {"id": "ASO", "credits": 6.0}, {"id": "TCI", "credits": 6.0}, {"id": "CAIM", "credits": 6.0}, {"id": "PCA", "credits": 6.0}, {"id": "SOA", "credits": 6.0}, {"id": "PI", "credits": 6.0}, {"id": "AD", "credits": 6.0}, {"id": "ABD", "credits": 6.0}, {"id": "STR", "credits": 6.0}, {"id": "SI", "credits": 6.0}, {"id": "SID", "credits": 6.0}, {"id": "PEC", "credits": 6.0}, {"id": "CPD", "credits": 6.0}, {"id": "PES", "credits": 6.0}, {"id": "MI", "credits": 6.0}, {"id": "SOAD", "credits": 6.0}, {"id": "ECSDI", "credits": 6.0}, {"id": "VLSI", "credits": 6.0}, {"id": "CL", "credits": 6.0}, {"id": "EDO", "credits": 6.0}, {"id": "IM", "credits": 6.0}, {"id": "APA", "credits": 6.0}, {"id": "LP", "credits": 6.0}, {"id": "MP", "credits": 6.0}, {"id": "PTI", "credits": 6.0}, {"id": "SIM", "credits": 6.0}, {"id": "CASO", "credits": 6.0}, {"id": "AA", "credits": 6.0}, {"id": "PAP", "credits": 6.0}, {"id": "SDX", "credits": 6.0}, {"id": "PSI", "credits": 6.0}, {"id": "G", "credits": 6.0}, {"id": "NE", "credits": 6.0}, {"id": "CN", "credits": 6.0}, {"id": "CBDE", "credits": 6.0}, {"id": "ASW", "credits": 6.0}, {"id": "MD", "credits": 6.0}]';
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

PIXI.loader
    .add('pokemonsBaseTexture', 'pokemons.png')
    .add('pokeballTexture', 'pokeball.png')
    .load(function (loader, resources) {
      pokemonBaseTexture = resources.pokemonsBaseTexture.texture;
      pokeballTexture = resources.pokeballTexture.texture;
      var widht = 122;
      var height = 134;
      for (var i = 0; i < 8; ++i) {
        for (var j = 0; j < 3; ++j) {
          pokemonsTextures.push(new Texture(pokemonBaseTexture, {
            x: i * widht,
            y: j * height,
            width: widht,
            height: height
          }));
        }
      }
      setup();
    });

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
  // Loading assigs from json file
  assigs = JSON.parse(assigsText);
  stage.addChild(pokemonContainer);

  // Set pokemon
  pokemons = createPokemon(pokemonsTextures);
  console.log(pokemons);

  // Set pokeball
  pokeball = createPokeball(pokeballTexture);

  creditsMessage = createCredits();
  stage.addChild(creditsMessage);

  requestAnimationFrame(gameLoop);
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
function createPokemon (textures) {
  var pokerand = Math.round(Math.random() * (textures.length - 1));
  var pokemonText = textures[pokerand];
  var pokemon = new PIXI.Sprite(pokemonText);
  var rand = Math.round(Math.random() * (assigs.length - 1));
  var assig = assigs[rand];
  pokemon.assig = assig.id;
  pokemon.credits = assig.credits;
  pokemon.assigMessage = new PIXI.Text(
      pokemon.assig,
      {fontFamily: 'Futura', fontSize: '32px', fill: 'black'}
  );
  pokemon.assigMessage.textWidth = textWidth(pokemon.assig, 'Futura', '32px'); // To get the size on pixels of the text

  pokemon.update = function (dt) {
    this.angle += 0.6 * dt;
    var middle = (maxWidth / 2 - 50);
    var sinInc = Math.sin(this.angle) * middle; 
    this.position.x = middle + sinInc;
    var offsetX = (100 - pokemon.assigMessage.textWidth) / 2;
    this.assigMessage.position.set(pokemon.position.x + offsetX,
                                   pokemon.position.y - 30);
  };
  pokemon.capture = function(dt) {
    this.angle += 0.6*dt;
    var sinInc = Math.sin(this.angle) ; 
    var newScale = this.scale.x - sinInc;
    if (newScale <= 0) {
      creditsMessage.increaseCredits(this.credits);
      pokemon.reset();
      pokeball.reset();
      state = play;
    } else {
      this.scale.set(newScale);  
    }
    
  };
  pokemon.reset = function () {
    var pokerand = Math.round(Math.random() * (textures.length - 1));
    this.texture = textures[pokerand];
    var rand = Math.round(Math.random() * (assigs.length - 1));
    var assig = assigs[rand];
    this.assig = assig.id;
    this.credits = assig.credits;
    this.assigMessage.text = this.assig;

    this.angle = 0;
    this.position.set(80, 50);
    this.scale.set(1);
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
  var combinedHalfWidths, combinedHalfHeights, vx, vy;

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
  return ((Math.abs(vx) < combinedHalfWidths) && (Math.abs(vy) < combinedHalfHeights))
}

// Others
function textWidth (txt, fontname, fontsize) {
  this.e = document.createElement('span');
  this.e.style.fontSize = fontsize;
  this.e.style.fontFamily = fontname;
  this.e.innerHTML = txt;
  document.body.appendChild(this.e);
  var w = this.e.offsetWidth;
  document.body.removeChild(this.e);
  return w
}
