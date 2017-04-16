
let scene, camera, renderer;
let geometry, material;
let dart;
let dartBox;
let scoreChangeNeeded;
let mouse, raycaster;
let score;
let shootDart;
let gui;
let tmpObject;
let objects = [];
let poppableBalloons = [];
let badBalloons = [];
let goodCubeBoxes = [];
let badCubeBoxes = [];
let DART_X = 0, DART_Y = -100, DART_Z = 500;
let guiParameters;
let numOfGoodBalloons = 7;
let numOfBadBalloons = 3;
let numOfPoppedGoodBalloons = 0;
let alertLight;
let alertLightOn = false;
let alertLightCounter = 0;
const alertLightDuration = 20;

init();
animate();


function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;
    camera.position.y = 250;

    /* Dart */
    let dartLoader = new THREE.ObjectLoader();
    dartLoader.load("models/dart/dart.json",function ( object ) {
        object.scale.set( 500, 500, 500 );
        object.rotateY(3.15);
        object.position.set(DART_X, DART_Y, DART_Z);
        dart = object;
        scene.add( dart );
        dartBox = new THREE.Box3().setFromObject(dart);
    });


    /* Balloon Stand Model */
    let loader = new THREE.ObjectLoader();
    loader.load("models/stand/stand.json",function ( object ) {
        object.scale.set( 6000, 6000, 6000 );
        object.translateY(-400);
        object.rotateY(1.57);
        scene.add( object );
    });

    for (let i = 0; i < 2; i++) {
        loader.load("models/stand/stand.json",function ( object ) {
            object.scale.set( 6000, 6000, 6000 );
            object.translateX(-1000 + (-500 * i));
            object.translateY(-400);
            object.translateZ(-1500 + (1000 * i));
            object.rotateY(-3.5);
            scene.add( object );
        });

        loader.load("models/stand/stand.json",function ( object ) {
                object.scale.set( 6000, 6000, 6000 );
                object.translateX(1000 + (500 * i));
                object.translateY(-400);
                object.translateZ(-1500 + (1000 * i));
                object.rotateY(.5);
                scene.add( object );
            });
    }

    /* Good Balloons */
    for (let i = 0; i < numOfGoodBalloons; i++) {
        let loader = new THREE.ObjectLoader();
        loader.load("models/goodBalloon/greenBalloon.json",function (goodCube) {
            goodCube.scale.set( 4000, 4000, 4000 );
            goodCube.rotateZ(.2);
            randomPlacement(goodCube);
            scene.add(goodCube);
            objects.push(goodCube);
            poppableBalloons.push(goodCube);
            let cubeBox = new THREE.Box3().setFromObject(goodCube);
            goodCubeBoxes.push(cubeBox);
        });
    }

    /* Bad Balloons */
    for (let i = 0; i < numOfBadBalloons; i++) {
        // let cubeGeo = new THREE.BoxGeometry(50, 50, 50);
        // let cubeMat = new THREE.MeshPhongMaterial({color: 0xff0000});
        // let badCube = new THREE.Mesh(cubeGeo, cubeMat);
        // randomPlacement(badCube);
        // scene.add(badCube);
        // objects.push(badCube);
        // badBalloons.push(badCube);
        // let cubeBox = new THREE.Box3().setFromObject(badCube);
        // badCubeBoxes.push(cubeBox);

        let loader = new THREE.ObjectLoader();
        loader.load("models/badBalloon/redBalloon.json",function (badCube) {
            badCube.scale.set( 4000, 4000, 4000 );
            badCube.rotateZ(.2);
            randomPlacement(badCube);
            scene.add(badCube);
            objects.push(badCube);
            badBalloons.push(badCube);
            let cubeBox = new THREE.Box3().setFromObject(badCube);
            badCubeBoxes.push(cubeBox);
        });
    }

    /* Ground */
    let cubeGeo = new THREE.BoxGeometry(1000000, 1, 100000);
    let cubeMat = new THREE.MeshLambertMaterial({color: 0xF5DEB3});
    let ground = new THREE.Mesh(cubeGeo, cubeMat);
    ground.translateY(-402);
    scene.add(ground);
    objects.push(ground);

    /* Light */
    const lightOne = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    lightOne.position.set(10, 40, 200);
    scene.add(lightOne);

    /* Alert Light */
    alertLight = new THREE.DirectionalLight(0xFF0000, 1.0);
    alertLight.position.set(10, 40, 200);

    score = 0;

    gui = new dat.GUI({
        height: 100
    });

    guiParameters =
        {
            gameScore: score, // numeric
            wControl: 'w',
            sControl: 's',
            aControl: 'a',
            dControl: 'd',
            qRotate:  'q',
            eRotate:  'e',
            zRotate:   'z',
            shootControl: 'Space or Click'

        };
    gui.add( guiParameters, 'gameScore' ).name('Score').listen();
    gui.add( guiParameters, 'wControl').name('Move Dart Up');
    gui.add( guiParameters, 'sControl').name('Move Dart Down');
    gui.add( guiParameters, 'aControl').name('Move Dart Left');
    gui.add( guiParameters, 'dControl').name('Move Dart Right');
    gui.add( guiParameters, 'qRotate').name('Rotate Dart on X');
    gui.add( guiParameters, 'eRotate').name('Rotate Dart on Y');
    gui.add( guiParameters, 'zRotate').name('Rotate Dart on Z');
    gui.add( guiParameters, 'shootControl').name('Shoot Dart');
    gui.open();
    guiParameters.gameScore = 0;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    /* Controls */

    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enableRotate = false;

    document.body.onkeydown = function (key) {
        switch (key.key) {
            case " ": // Space Bar
                controls.enableRotate ? controls.enableRotate = false : controls.enableRotate = true;
                shootDart = true;
                update();
                break;
            case "w": // w
                dart.position.y += 20;
                break;
            case "a": // a
                dart.position.x -= 20;
                break;
            case "s": // s
                dart.position.y -=20;
                break;
            case "d": // d
                dart.position.x += 20;
                break;
            case "q": // q
                dart.rotation.x += .1;
                break;
            case "e": // e
                dart.rotation.y += .1;
                break;
            case "z": // z
                dart.rotation.z += .1;
                break;
            case "Q": // q
                dart.rotation.x -= .1;
                break;
            case "E": // e
                dart.rotation.y -= .1;
                break;
            case "Z": // z
                dart.rotation.z -= .1;
                break;
            /* Used for debugging (or cheating... I'm not a cop!) */
            // case 82: // r
            //     dart.position.z +=20;
            //     break;
            // case 70: // f
            //     dart.position.z  -=20;
            //     break;
        }
    };

    document.body.appendChild( renderer.domElement );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );

}
function onDocumentTouchStart( event ) {
    event.preventDefault();
    onDocumentMouseDown( event );

}

function onDocumentMouseDown( event ) {
    shootDart = true;
    update();

}

function randomPlacement(object){

    tmpObject = object.clone();
    tmpObject.position.set(0,0,0);

    let translationX = Math.floor(Math.random() * (250 - (-250))) + (-250);
    let translationY = Math.floor(Math.random() * (130 - (-130))) + (-130);
    tmpObject.translateX(translationX);
    tmpObject.translateY(translationY);

    let cmpBox = new THREE.Box3().setFromObject(tmpObject);

    for (let i = 0; i < goodCubeBoxes.length; i++) {
        goodCubeBoxes[i].setFromObject(poppableBalloons[i]);

        if (cmpBox.intersectsBox(goodCubeBoxes[i])) {
            randomPlacement(object);
        }
    }

    for (let i = 0; i < badCubeBoxes.length; i++) {
        badCubeBoxes[i].setFromObject(badBalloons[i]);

        if (cmpBox.intersectsBox(badCubeBoxes[i])) {
            randomPlacement(object);
        }
    }

    // object.position.set(0,0,0);
    object.translateX(translationX);
    object.translateY(translationY);

    if(object.position.x > 250 || object.position.x < -250){
        object.position.set(0,0,0);
        randomPlacement(object);
    }

    if(object.position.y > 130 || object.position.y < -130){
        object.position.set(0,0,0);
        randomPlacement(object);
    }

}

function update(){

    dartBox.setFromObject(dart);

    for (let i = 0; i < goodCubeBoxes.length; i++) {
        goodCubeBoxes[i].setFromObject(poppableBalloons[i]);

        if (dartBox.intersectsBox(goodCubeBoxes[i])) {
            removeObject(poppableBalloons[i]);
            numOfPoppedGoodBalloons++;
            updateScore(true);
            resetDart();
        }
    }

    for (let i = 0; i < badCubeBoxes.length; i++) {
        badCubeBoxes[i].setFromObject(badBalloons[i]);

        if (dartBox.intersectsBox(badCubeBoxes[i])) {
            removeObject(badBalloons[i]);
            scene.add(alertLight);
            alertLightOn = true;
            updateScore(false);
            resetDart();
        }
    }

    if(dart.position.z < -20){
        resetDart();
    }

    if(shootDart){
        dart.position.z += -20;
        dart.position.y += -10;
        dart.rotateZ(.5);
    }

    if (alertLightOn) {
        if (alertLightCounter > alertLightDuration) {
            scene.remove(alertLight);
            alertLightOn = false;
            alertLightCounter = 0;
        } else {
            alertLightCounter++;
        }
    }
}

function resetDart(){
    dart.position.set(DART_X, DART_Y, DART_Z);
    shootDart = false;
}

function removeObject(object) {
    object.position.set(1001,1001,1001); //trash
    scene.remove(object);
}

function updateScore(point) {
    if (point == true) {
        score++;
        guiParameters.gameScore++;
    }
    else{
        score--;
        guiParameters.gameScore--;
    }
    scoreChangeNeeded = false;

    if (numOfPoppedGoodBalloons == numOfGoodBalloons) {

        score = 0;

        for (let mesh in poppableBalloons) {
            let balloon = poppableBalloons[mesh];
            scene.remove(balloon);
        }
        for (let mesh in badBalloons) {
            let balloon = badBalloons[mesh];
            scene.remove(balloon);

        }
        scene.remove(dart);

        let loader = new THREE.FontLoader();
        loader.load('fonts/Immortal_Regular.json', function (font) {

            let textGeometry = new THREE.TextGeometry("You Won!", {

                font: font,

                size: 100,
                height: 30,
                curveSegments: 20,

                bevelThickness: 3,
                bevelSize: 3,
                bevelEnabled: true

            });

            let textMaterial = new THREE.MeshPhongMaterial(
                {color: 0xff0000, specular: 0xffffff}
            );

            let text = new THREE.Mesh(textGeometry, textMaterial);
            text.translateX(-370);
            scene.add(text);

        });
    }
}

function animate() {

    requestAnimationFrame( animate );

    for (let mesh in poppableBalloons) {
        let balloon = poppableBalloons[mesh];
        balloon.rotation.y += 0.02;
    }

    for (let mesh in badBalloons) {
        let balloon = badBalloons[mesh];
        balloon.rotation.y += 0.02;
    }

    update();
    renderer.render( scene, camera );
}

