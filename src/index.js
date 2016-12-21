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
var renderer = autoDetectRenderer(maxWidth, maxHeight);
document.body.appendChild(renderer.view);

state = play;

// Game States
function menu () {

}

function play () {

}

function end () {

}


function setup () {

}

function gameLoop () {
  requestAnimationFrame(gameLoop);
  state();
  renderer.render(stage);
}