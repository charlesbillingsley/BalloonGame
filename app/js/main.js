
let scene, camera, renderer;
let geometry, material, mesh;
// let cubeGeo1, cubeMat1, goodCube1;
let dartGeo, dartMat, dart;
let dartBox;//, cubeBox1, cubeBox2;
let scoreChangeNeeded;
let mouse, raycaster;
let score;
let shootDart;
let gui;
let objects = [];
let poppableBalloons = [];
let cubeBoxes = [];

init();
animate();


function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    /* Dart */

    dartGeo = new THREE.BoxGeometry(20, 40, 20, 20);
    dartMat = new THREE.MeshPhongMaterial({color: 0xffffff});
    dart = new THREE.Mesh(dartGeo, dartMat);
    dart.rotateX(-20);
    dart.position.set(0,0,100);
    scene.add(dart);
    dartBox = new THREE.Box3().setFromObject(dart);


    /* Balloon Stand Model */

    let loader = new THREE.ObjectLoader();
    loader.load("models/stand.json",function ( object ) {
        object.scale.set( 6000, 6000, 6000 );
        object.translateY(-400);
        object.rotateY(1.57);
        scene.add( object );
    });


    /* Balloon Stand Model */

    loader.load("models/stand.json",function ( object ) {
        object.scale.set( 6000, 6000, 6000 );
        object.translateX(-1000);
        object.translateY(-400);
        object.translateZ(-1500);
        object.rotateY(-3.5);
        scene.add( object );
    });

    loader.load("models/stand.json",function ( object ) {
        object.scale.set( 6000, 6000, 6000 );
        object.translateX(1000);
        object.translateY(-400);
        object.translateZ(-1500);
        object.rotateY(.5);
        scene.add( object );
    });

    for (let i = 0; i < 7; i++) {
        let cubeGeo = new THREE.BoxGeometry(50, 50, 50);
        let cubeMat = new THREE.MeshPhongMaterial({color: 0xff0000});
        let goodCube = new THREE.Mesh(cubeGeo, cubeMat);
        goodCube.translateX(Math.floor(Math.random() * (270 - (-270))) + (-270));
        goodCube.translateY(Math.floor(Math.random() * (150 - (-150))) + (-150));
        scene.add(goodCube);
        objects.push(goodCube);
        poppableBalloons.push(goodCube);
        let cubeBox = new THREE.Box3().setFromObject(goodCube);
        cubeBoxes.push(cubeBox);
    }

    cubeGeo = new THREE.BoxGeometry(1000000, 1, 100000);
    cubeMat = new THREE.MeshLambertMaterial({color: 0xA0522D});
    let ground = new THREE.Mesh(cubeGeo, cubeMat);
    ground.translateY(-402);
    scene.add(ground);
    objects.push(ground);

    const lightOne = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    lightOne.position.set(10, 40, 200);
    scene.add(lightOne);

    score = 0;

    gui = new dat.GUI({
        height: 100
    });
    let parameters =
        {
            a: score, // numeric

        };
    // gui.add( parameters )
    gui.add( parameters, 'a' ).name('Score').listen();
    gui.open();



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
        if (key.keyCode == 32) {
            controls.enableRotate ? controls.enableRotate = false : controls.enableRotate = true;
        }
        if (key.keyCode == 87) { //w
            dart.position.y += 20;
        }
        if (key.keyCode == 65) { //a
            dart.position.x -= 20;
        }
        if (key.keyCode == 83) { //s
            dart.position.y -=20;
        }
        if (key.keyCode == 68) { //d
            dart.position.x += 20;
        }
        if (key.keyCode == 82) { //r
            dart.position.z +=20;
        }
        if (key.keyCode == 70) { //f
            dart.position.z  -=20;
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

function update(){

    dartBox.setFromObject(dart);

    for (let i = 0; i < cubeBoxes.length; i++) {
        cubeBoxes[i].setFromObject(poppableBalloons[i]);

        if (dartBox.intersectsBox(cubeBoxes[i])) {
            removeObject(poppableBalloons[i]);
            updateScore(true);
            resetDart();
        }
    }

    if(dart.position.z < -20){
        resetDart();
    }

    if(shootDart){
        dart.position.z += -2;
        dart.rotateY(0.1);
    }
}

function resetDart(){
    dart.position.set(0,0,100);
    shootDart = false;
}

function removeObject(object) {
    object.position.set(1001,1001,1001); //trash
    scene.remove(object);
}

function updateScore(point) {
    if (point == true) {
        score++;
    }
    else{
        score--;
    }
    scoreChangeNeeded = false;

    document.getElementById("score").textContent="Score :" + score;
    if (score == 7) {

        score = 0;

        for (let mesh in poppableBalloons) {
            let balloon = poppableBalloons[mesh];
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
        balloon.rotation.x += 0.01;
        balloon.rotation.y += 0.02;
    }
    update();
    renderer.render( scene, camera );

}

