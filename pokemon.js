function init () {
var Screen = {
    height: window.innerHeight,
    width: window.innerWidth
};
var MAX_VELOCITY = Screen.height * 0.009;
var Resources = {
    pokeball: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/374756/pkmngo-pokeball.png',
    pokeballActive: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/374756/pkmngo-pokeballactive.png',
    pokeballClosed: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/374756/pkmngo-pokeballclosed.png'
};

var Ball = {
    id: 'ball',
    size: 50,
    x: 0,
    y: 0,
    inMotion: false,
    moveBall: function(x, y) {
        Ball.x = x;
        Ball.y = y;
        var BallElement = document.getElementById(Ball.id);
        BallElement.style.top = Ball.y + 'px';
        BallElement.style.left = Ball.x + 'px';
    },
    getElement() {
        return document.getElementById(Ball.id);
    },
    resetBall: function() {
        Ball.moveBall(Screen.width / 2 - (Ball.size / 2), Screen.height - (Ball.size + 10));
        var BallElement = document.getElementById(Ball.id);
        BallElement.style.transform = "";
        BallElement.style.width = BallElement.style.height = Ball.size + 'px';
        BallElement.style.backgroundImage = "url('" + Resources.pokeball + "')";
        Ball.inMotion = false;
    },
    savePosition: function() {
        var ballEle = document.getElementById('ball');
        var ballRect = ballEle.getBoundingClientRect();
        ballEle.style.transform = "";
        ballEle.style.top = ballRect.top + 'px';
        ballEle.style.left = ballRect.left + 'px';
        ballEle.style.height = ballEle.style.width = ballRect.width + 'px';
    }
};

//Initial Setup



var touchElement
var touchRegion
var CustomSwipe
var CustomPan
var endPan


    resetState();

    //Move omanyte
    anime({
        targets: ['#target'],
        rotate: 20,
        duration: 800,
        loop: true,
        easing: 'easeInOutQuad',
        direction: 'alternate'
    });

    /* Gesture Bindings */
    touchElement = document.getElementById('touch-layer');
    touchRegion = new ZingTouch.Region(touchElement);
    CustomSwipe = new ZingTouch.Swipe({
        escapeVelocity: 0.1
    })

    CustomPan = new ZingTouch.Pan();
    endPan = CustomPan.end;
    CustomPan.end = function(inputs) {
        setTimeout(function() {
            if (Ball.inMotion === false) {
                Ball.resetBall();
            }
        }, 100);
        return endPan.call(this, inputs);        
    }


    touchRegion.bind(touchElement, CustomPan, function(e) {
        Ball.moveBall(e.detail.events[0].x - Ball.size / 2, e.detail.events[0].y - Ball.size / 2);
    });

    touchRegion.bind(touchElement, CustomSwipe, function(e) {
        Ball.inMotion = true;
        var screenEle = document.getElementById('screen');
        var screenPos = screenEle.getBoundingClientRect();
        var angle = e.detail.data[0].currentDirection;
        var rawVelocity = velocity = e.detail.data[0].velocity;
        velocity = (velocity > MAX_VELOCITY) ? MAX_VELOCITY : velocity;

        //Determine the final position.
        var scalePercent = Math.log(velocity + 1) / Math.log(MAX_VELOCITY + 1);
        var destinationY = (Screen.height - (Screen.height * scalePercent)) + screenPos.top;
        var movementY = destinationY - e.detail.events[0].y;

        //Determine how far it needs to travel from the current position to the destination.
        var translateYValue = -0.75 * Screen.height * scalePercent;
        var translateXValue = 1 * (90 - angle) * -(translateYValue / 100);

        anime.remove('#ring-fill');

        anime({
                targets: ['#ball'],
                translateX: {
                    duration: 300,
                    value: translateXValue,
                    easing: 'easeOutSine'
                },
                translateY: {
                    value: movementY * 1.25 + 'px',
                    duration: 300,
                    easing: 'easeOutSine'
                },
                scale: {
                    value: 1 - (0.5 * scalePercent),
                    easing: 'easeInSine',
                    duration: 300
                },
                complete: function() {
                    if (movementY < 0) {
                        throwBall(movementY, translateXValue, scalePercent);
                    } else {
                        setTimeout(resetState, 400);
                    }
                }
            })
            //End
    });



window.onresize = function() {
    Screen.height = window.innerHeight;
    Screen.width = window.innerWidth;
    MAX_VELOCITY = Screen.height * 0.009;
    resetState();
}





function throwBall(movementY,translateXValue, scalePercent){
    //Treat translations as fixed.
    Ball.savePosition();
    anime({
        targets: ['#ball'],
        translateY: {
            value: movementY * -0.5 + 'px',
            duration: 400,
            easing: 'easeInOutSine'
        },
        translateX: {
            value: -translateXValue * 0.25,
            duration: 400,
            easing: 'linear'
        },
        scale: {
            value: 1 - (0.25 * scalePercent),
            easing: 'easeInSine',
            duration: 400
        },
        complete: determineThrowResult
    })
}

function determineThrowResult() {
    //Determine hit-region
    var targetCoords = getCenterCoords('target');
    var ballCoords = getCenterCoords('ball');

    //Determine if the ball is touching the target.
    var radius = document.getElementById('target').getBoundingClientRect().width / 2;
    if (ballCoords.x > targetCoords.x - radius &&
        ballCoords.x < targetCoords.x + radius &&
        ballCoords.y > targetCoords.y - radius &&
        ballCoords.y < targetCoords.y + radius) {

        Ball.savePosition();
        var ballOrientation = (ballCoords.x < targetCoords.x) ? -1 : 1;
        anime({
            targets: ['#ball'],
            translateY: {
                value: -1.15 * radius,
                duration: 200,
                easing: 'linear'
            },
            translateX: {
                value: 1.15 * radius * ballOrientation,
                duration: 200,
                easing: 'linear'
            },
            scaleX: {
                value: ballOrientation,
                duration: 200,
            },
            complete: function() {
                var ball = Ball.getElement();
                ball.style.backgroundImage = "url('" + Resources.pokeballActive + "')";
                emitParticlesToPokeball();
            }
        });
    } else {
        setTimeout(resetState, 400);
    }
}


function emitParticlesToPokeball() {
    var particles = [];
    var targetEle = getCenterCoords('target');
    var ballEle = Ball.getElement();
    var ballRect = ballEle.getBoundingClientRect();
    var particleLeft;
    var particleRight;
    var palette = [
        '#E4D3A8',
        '#6EB8C0',
        '#FFF',
        '#2196F3'
    ]
    var particleContainer = document.getElementById('particles');
    for (var i = 0; i < 50; i++) {
        var particleEle = document.createElement('div');
        particleEle.className = 'particle';
        particleEle.setAttribute('id', 'particle-' + i);;
        particleLeft = getRandNum(-60, 60) + targetEle.x;
        particleEle.style.left = particleLeft + 'px';
        particleRight = getRandNum(-60, 60) + targetEle.y;
        particleEle.style.top = particleRight + 'px';
        particleEle.style.backgroundColor = palette[getRandNum(0, palette.length)]
        particleContainer.appendChild(particleEle);
        anime({
            targets: ['#particle-' + i],
            translateX: {
                value: ballRect.left - particleLeft,
                delay: 100 + (i * 10)
            },
            translateY: {
                value: ballRect.top + (Ball.size / 2) - particleRight,
                delay: 100 + (i * 10),
            },
            opacity: {
                value: 0,
                delay: 100 + (i * 10),
                duration: 800,
                easing: 'easeInSine'
            }
        });
        anime({
            targets: ['#target'],
            opacity: {
                value: 0,
                delay: 200,
                easing: 'easeInSine'
            }
        });
    }
    setTimeout(function() {
        var ball = Ball.getElement();
        ball.style.backgroundImage = "url('" + Resources.pokeballClosed + "')";
        document.getElementById('particles').innerHTML = "";
        Ball.savePosition();

        anime({
            targets: ['#ball'],
            translateY: {
                value: "200px",
                delay: 400,
                duration: 400,
                easing: 'linear'
            },
            complete: function() {
                Ball.resetBall();
            }
        });
        setTimeout(function() {
            animateCaptureState();
            resetState();
        }, 750);

    }, 1000);
}



function animateCaptureState() {
    var ballContainer = document.getElementById('capture-screen');
    ballContainer.classList.toggle('hidden');

    var duration = 500;
    anime({
        targets: ['#capture-ball'],
        rotate: 40,
        duration: duration,
        easing: 'easeInOutBack',
        loop: true,
        direction: 'alternate'
    });

    var ringRect = (document.getElementById('ring-active')).getBoundingClientRect();
    var successRate = ((150 - ringRect.width) / 150) * 100;
    var seed = getRandNum(0, 100);
    setTimeout(function() {

        anime.remove('#capture-ball');

        if (seed < Math.floor(successRate)) {
            var captureBall = document.getElementById('capture-ball');
            var buttonContainer = document.getElementById('capture-ball-button-container');
            buttonContainer.classList.toggle('hidden');

            //Captured
            var captureStatus = document.getElementById('capture-status');
            captureStatus.classList.toggle('hidden');
            captureStatus.innerHTML = "You caught Omanyte!"
            makeItRainConfetti();

            anime({
                targets: ['#capture-ball-button-container'],
                opacity: {
                    value: 0,
                    duration: 800,
                    easing: 'easeInSine'
                },
                complete: function() {
                    setTimeout(function() {
                        var ballContainer = document.getElementById('capture-screen');
                        ballContainer.classList.toggle('hidden');
                        var buttonContainer = document.getElementById('capture-ball-button-container');
                        buttonContainer.classList.toggle('hidden');
                        buttonContainer.style.opacity = "";
                        document.getElementById('capture-status').classList.toggle('hidden');
                    }, 800);
                }
            });

        } else {
            var poofContainer = document.getElementById('poof-container');
            poofContainer.classList.toggle('hidden');

            var captureStatus = document.getElementById('capture-status');
            captureStatus.innerHTML = "Omanyte Escaped!"
            captureStatus.classList.toggle('hidden');

            anime({
                targets: ['#poof'],
                scale: {
                    value: 20,
                    delay: 400,
                    easing: 'linear',
                    duration: 600
                },
                complete: function() {
                    var ballContainer = document.getElementById('capture-screen');
                    ballContainer.classList.toggle('hidden');

                    var poofEle = document.getElementById('poof');
                    poofEle.style.transform = "";
                    var poofContainer = document.getElementById('poof-container');
                    poofContainer.classList.toggle('hidden');

                    var captureStatus = document.getElementById('capture-status');
                    captureStatus.classList.toggle('hidden');
                }
            })
        }
    }, duration * 6);

}


function makeItRainConfetti() {
    for (var i = 0; i < 100; i++) {
        var particleContainer = document.getElementById('capture-confetti');
        var particleEle = document.createElement('div');
        particleEle.className = 'particle';
        particleEle.setAttribute('id', 'particle-' + i);
        particleLeft = window.innerWidth / 2;
        particleEle.style.left = particleLeft + 'px';
        particleTop = window.innerHeight / 2;
        particleEle.style.top = particleTop + 'px';
        particleEle.style.backgroundColor = ((getRandNum(0, 2)) ? '#FFF' : '#4aa6fb')
        particleContainer.appendChild(particleEle);
        anime({
            targets: ['#particle-' + i],
            translateX: {
                value: ((getRandNum(0, 2)) ? -1 : 1) * getRandNum(0, window.innerWidth / 2),
                delay: 100
            },
            translateY: {
                value: ((getRandNum(0, 2)) ? -1 : 1) * getRandNum(0, window.innerHeight / 2),
                delay: 100,
            },
            opacity: {
                value: 0,
                duration: 800,
                easing: 'easeInSine'
            },
            complete: function() {
                document.getElementById('capture-confetti').innerHTML = "";
            }
        });
    }
}

function toggleInfoScreen() {
    var infoScreen = document.getElementById('info-screen');
    var infoButton = document.getElementById('info-button');
    infoScreen.classList.toggle('hidden');
    infoButton.innerHTML = (infoScreen.className === 'hidden') ? "?" : 'X';
}

/* * * * * * * * * * * * *
* Universal Helpers
* * * * * * * * * * * * */
function resetState() {
    Ball.resetBall();
    document.getElementById('target').style.opacity = 1;
    //Adjust Ring
    var ring = document.getElementById('ring-fill');
    ring.style.height = "150px";
    ring.style.width = "150px";
    anime({
        targets: ['#ring-fill'],
        height: "5px",
        width: "5px",
        duration: 3000,
        loop: true,
        easing: 'linear'
    })
}

function getCenterCoords(elementId) {
    var rect = document.getElementById(elementId).getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

function getRandNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

}