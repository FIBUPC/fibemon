const PIXI = require('pixi.js');

var Container = PIXI.Container;
var autoDetectRenderer = PIXI.autoDetectRenderer;
var Texture = PIXI.Texture;
var Text = PIXI.Text;

// Creation of the canvas
var myView = document.getElementById('myCanvas');
myView.width  = window.innerWidth;
myView.height = window.innerHeight;

maxWidth = myView.width;
maxHeight = myView.height;
var renderer = autoDetectRenderer(maxWidth, maxHeight, {view: myView, transparent: true});
document.body.appendChild(renderer.view);

var assigsText = '[{"id": "IC", "credits": 7.5}, {"id": "FM", "credits": 7.5}, {"id": "PRO1", "credits": 7.5}, {"id": "F", "credits": 7.5}, {"id": "PRO2", "credits": 7.5}, {"id": "EC", "credits": 7.5}, {"id": "M1", "credits": 7.5}, {"id": "M2", "credits": 7.5}, {"id": "PE", "credits": 6.0}, {"id": "SO", "credits": 6.0}, {"id": "CI", "credits": 6.0}, {"id": "BD", "credits": 6.0}, {"id": "EDA", "credits": 6.0}, {"id": "PROP", "credits": 6.0}, {"id": "EEE", "credits": 6.0}, {"id": "XC", "credits": 6.0}, {"id": "IES", "credits": 6.0}, {"id": "AC", "credits": 6.0}, {"id": "GPS", "credits": 6.0}, {"id": "LI", "credits": 6.0}, {"id": "SO2", "credits": 6.0}, {"id": "AC2", "credits": 6.0}, {"id": "TC", "credits": 6.0}, {"id": "SIO", "credits": 6.0}, {"id": "DSBM", "credits": 6.0}, {"id": "DSI", "credits": 6.0}, {"id": "CSI", "credits": 6.0}, {"id": "IO", "credits": 6.0}, {"id": "TXC", "credits": 6.0}, {"id": "XC2", "credits": 6.0}, {"id": "CAP", "credits": 6.0}, {"id": "PAR", "credits": 6.0}, {"id": "IA", "credits": 6.0}, {"id": "A", "credits": 6.0}, {"id": "AS", "credits": 6.0}, {"id": "PDS", "credits": 6.0}, {"id": "ER", "credits": 6.0}, {"id": "DBD", "credits": 6.0}, {"id": "IDI", "credits": 6.0}, {"id": "ADEI", "credits": 6.0}, {"id": "ASO", "credits": 6.0}, {"id": "TCI", "credits": 6.0}, {"id": "CAIM", "credits": 6.0}, {"id": "PCA", "credits": 6.0}, {"id": "SOA", "credits": 6.0}, {"id": "PI", "credits": 6.0}, {"id": "AD", "credits": 6.0}, {"id": "ABD", "credits": 6.0}, {"id": "STR", "credits": 6.0}, {"id": "SI", "credits": 6.0}, {"id": "SID", "credits": 6.0}, {"id": "PEC", "credits": 6.0}, {"id": "CPD", "credits": 6.0}, {"id": "PES", "credits": 6.0}, {"id": "MI", "credits": 6.0}, {"id": "SOAD", "credits": 6.0}, {"id": "ECSDI", "credits": 6.0}, {"id": "VLSI", "credits": 6.0}, {"id": "CL", "credits": 6.0}, {"id": "EDO", "credits": 6.0}, {"id": "IM", "credits": 6.0}, {"id": "APA", "credits": 6.0}, {"id": "LP", "credits": 6.0}, {"id": "MP", "credits": 6.0}, {"id": "PTI", "credits": 6.0}, {"id": "SIM", "credits": 6.0}, {"id": "CASO", "credits": 6.0}, {"id": "AA", "credits": 6.0}, {"id": "PAP", "credits": 6.0}, {"id": "SDX", "credits": 6.0}, {"id": "PSI", "credits": 6.0}, {"id": "G", "credits": 6.0}, {"id": "NE", "credits": 6.0}, {"id": "CN", "credits": 6.0}, {"id": "CBDE", "credits": 6.0}, {"id": "ASW", "credits": 6.0}, {"id": "MD", "credits": 6.0}]';

// Texture related vars
var pokemonsTextures = [];
var pokemonBaseTexture, pokeballTexture;
var pokemonTextWidth = 64;
var pokemonTextHeight = 64;

var pokeball, pokemons;
var startMessage, endMessage;
var lifeMessage, creditsMessage;

var numPokemons = 135;
var life = 3;

var state;

var stage = new Container();
var startContainer = new Container();
var endContainer = new Container();
var playContainer = new Container();
var pokemonContainer = new Container();

stage.addChild(startContainer);
stage.addChild(endContainer);
stage.addChild(playContainer);

var scale = 1;

state = start;

PIXI.loader
    .add('pokemonsBaseTexture', 'pokemons2.png')
    .add('pokeballTexture', 'pokeball.png')
    .load(function (loader, resources) {
      pokemonBaseTexture = resources.pokemonsBaseTexture.texture;
      pokeballTexture = resources.pokeballTexture.texture;
      for (var x = 0; x <= numPokemons; ++x) {
        var i = x % 16;
        var j = Math.round(x / 16);
        pokemonsTextures.push(new Texture(pokemonBaseTexture, {
          x: i * pokemonTextWidth,
          y: j * pokemonTextHeight,
          width: pokemonTextWidth,
          height: pokemonTextHeight
        }));
      }
      setup();
    });

// Setup resizer
renderer.autoresize = true;
renderer.resizeCanvas = function() {
  maxWidth = window.innerWidth - 5;
  maxHeight = window.innerHeight - 5;
  myView.width = maxWidth;
  myView.height = maxHeight;
  renderer.resize(maxWidth, maxHeight); 
};
window.addEventListener('resize',renderer.resizeCanvas);
renderer.resizeCanvas();

// Game States
function start () {
  startContainer.visible = true;
  endContainer.visible = false;
  playContainer.visible = false;
}
function end () {
  startContainer.visible = false;
  endContainer.visible = true;
  playContainer.visible = false;
}
function play (ts) {
  startContainer.visible = false;
  endContainer.visible = false;
  playContainer.visible = true;

  if(this.startTime == null) this.startTime = ts;
  var dt = (ts - this.startTime)/700;
  this.startTime = ts;

  pokeball.update();
  pokemons.update(dt);

  // Change state
  if (hitTestRectangle(pokemons,pokeball) && !pokeball.dragging){
    state = capture;
  }
  if (creditsMessage.credits > 12) {
    state = end;
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
  setupStart();
  setupPlay();
  setupEnd();
  requestAnimationFrame(gameLoop);
}

function setupStart () {
  var button = createButton(0, 0, 200, 100, 'Start', function () {
    state = play;
  });
  startContainer.addChild(button);
}
function setupPlay () {
  setupAssigs();
  setupPokemons();
  setupPokeball();
  setupCredits();
}
function setupEnd() {
  var fontFamily = 'Arial';
  var fontSize = '24px';
  var text = new Text(
      'Has acabat la carrera, Felicitats!',
      {fontFamily: fontFamily, fontSize: fontSize, fill: 'black'}
  );
  endContainer.addChild(text);
  var button = createButton(0, 50, 200, 100, 'Torna a començar', function () {
    creditsMessage.reset();
    pokemons.reset();
    state = play;
  });
  endContainer.addChild(button);
}

function setupAssigs () {
  // Loading assigs from json file
  assigs = JSON.parse(assigsText);
  playContainer.addChild(pokemonContainer);
}
function setupPokemons () {
  pokemons = createPokemon(pokemonsTextures);
  renderer.pokemons = pokemons;
}
function setupPokeball () {
  // Set pokeball
  pokeball = createPokeball(pokeballTexture);
  renderer.pokeball = pokeball;
}
function setupCredits () {
  creditsMessage = createCredits();
  playContainer.addChild(creditsMessage);
}

function createCredits () {
  var fontFamily = 'Arial';
  var fontSize = '24px';
  var text = new Text(
      '',
      {fontFamily: fontFamily, fontSize: fontSize, fill: 'black'}
  );
  text.fontFamily = fontFamily;
  text.fontSize = fontSize;
  text.base = 'Credits: ';

  text.increaseCredits = function increaseCredits (inc) {
    this.credits += inc;
    this.text = this.base + this.credits;
  };
  text.reset = function () {
    this.credits = 0;
    this.text = this.base + this.credits;
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
    if (this.inertia) {
      if (this.speed.y===0) return this.reset();

      this.position.x += this.speed.x;
      this.position.y += this.speed.y;

      //Gravity strikes
      this.speed.y += 0.0981;
    }

    // Look if pokeball is out of bounds
    if (pokeball.position.y > maxHeight) pokeball.reset();
    if (pokeball.position.y < maxHeight/4+20 && pokeball.dragging) pokeball.reset();
    if (pokeball.position.y < -100) pokeball.reset();
    if (pokeball.position.x > maxWidth || pokeball.position.x < 0) pokeball.reset();
  };
  pokeball.reset = function () {
    this.thrown = false;
    this.position.x = this.origX;
    this.position.y = this.origY;
    this.startTime = null;
    this.inertia = false;
    this.interactive = true;
    this.buttonMode = true;
    this.dragging = false;
    this.alpha = 1.0;
    this.data = null;
    this.speed = {
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
    this.thrown = true;

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
  playContainer.addChild(pokeball);
  return pokeball;
}
function createPokemon (textures) {
  var pokemon = new PIXI.Sprite(textures[0]);
  pokemon.fontSize = '24px';
  pokemon.fontFamily = 'Arial';
  pokemon.assigMessage = new PIXI.Text(
      '',
      {fontFamily: pokemon.fontFamily, fontSize: pokemon.fontSize, fill: 'black'}
  );
  // To get the size on pixels of the text
  pokemon.assigMessage.textWidth = textWidth(pokemon.assig, pokemon.fontFamily, pokemon.fontSize);

  pokemon.update = function (dt) {
    this.angle += 0.6 * dt;
    var middle = (maxWidth / 2 - 50);
    var sinInc = Math.sin(this.angle) * middle; 
    this.position.x = middle + sinInc;
    var offsetX = (pokemonTextWidth - pokemon.assigMessage.textWidth) / 2;
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
    var assigRand = Math.round(Math.random() * (assigs.length - 1));
    // This is so that the same pokemons appear for the each assig (if repeated)
    var pokeRand = assigRand % textures.length;

    // Save assig object
    var assig = assigs[assigRand];

    this.assig = assig.id;
    this.credits = assig.credits;
    this.assigMessage.text = this.assig;
    this.assigMessage.textWidth = textWidth(pokemon.assig, pokemon.fontFamily, pokemon.fontSize);

    this.texture = textures[pokeRand];
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
function createButton (x, y, w, h, t, f) {
  var button = new Container();
  button.position.set(x, y);
  button.interactive = true;
  button.mousedown = f;
  button.touchstart = f;
  button.mouseover = function () {
    button.box.tint = 0xffffff; // Clean tint
    button.box.tint = 0x44aa33;
  };
  button.mouseout = function () {
    button.box.tint = 0xffffff; // Clean tint
    button.box.tint = 0x66ff33;
  };

  // Box
  var box = new PIXI.Graphics();
  box.beginFill(0xFFFFFF);
  box.drawRect(0, 0, w, h);
  box.endFill();
  button.addChild(box);
  button.box = box;
  button.box.tint = 0x66ff33;

  // Text
  button.fontFamily = 'Arial';
  button.fontSize = '32px';
  button.text = new Text(
      t,
      {fontFamily: button.fontFamily, fontSize: button.fontSize, fill: 'white'}
  );
  button.text.textSize = textWidth(t, button.fontFamily, button.fontSize);
  button.text.position.set((w - button.text.textSize) / 2, (h - 32) / 2);
  button.addChild(button.text);

  return button
}