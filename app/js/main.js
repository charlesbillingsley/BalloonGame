
let scene, camera, renderer;
let geometry, material, mesh;
// let cubeGeo1, cubeMat1, goodCube1;
let dartGeo, dartMat, dart;
let dartBox;//, cubeBox1, cubeBox2;
let scoreChangeNeeded;
let mouse, raycaster;
let score;
let gui;
let objects = [];
let popableBalloons = [];
let cubeBoxes = [];

init();
animate();


function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    //Dart

    dartGeo = new THREE.BoxGeometry(20, 40, 20, 20);
    dartMat = new THREE.MeshPhongMaterial({color: 0xffffff});
    dart = new THREE.Mesh(dartGeo, dartMat);
    dart.rotateX(-20);
    scene.add(dart);
    dartBox = new THREE.Box3().setFromObject(dart);


    /* Balloon Stand Model */

    let loader = new THREE.ObjectLoader();
    loader.load("models/stand.json",function ( object ) {
        object.scale.set( 6000, 6000, 6000 );
        //object.translateX(-400);
        object.translateY(-400);
        //object.translateZ(950);
        object.rotateY(1.57);
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
        popableBalloons.push(goodCube);
        let cubeBox = new THREE.Box3().setFromObject(goodCube);
        cubeBoxes.push(cubeBox);
    }

    // cubeGeo1 = new THREE.BoxGeometry(50, 50, 50);
    // cubeMat1 = new THREE.MeshPhongMaterial({color: 0xff0000});
    // goodCube1 = new THREE.Mesh(cubeGeo1, cubeMat1);
    // goodCube1.translateX(Math.floor(Math.random() * (270 - (-270))) + (-270));
    // goodCube1.translateY(Math.floor(Math.random() * (150 - (-150))) + (-150));
    // scene.add(goodCube1);
    // objects.push(goodCube1);
    // popableBalloons.push(goodCube1);
    // cubeBox1 = new THREE.Box3().setFromObject(goodCube1);
    //
    // cubeGeo2 = new THREE.BoxGeometry(50, 50, 50);
    // cubeMat2 = new THREE.MeshPhongMaterial({color: 0xff0000});
    // goodCube2 = new THREE.Mesh(cubeGeo2, cubeMat2);
    // goodCube2.translateX(Math.floor(Math.random() * (270 - (-270))) + (-270));
    // goodCube2.translateY(Math.floor(Math.random() * (150 - (-150))) + (-150));
    // scene.add(goodCube2);
    // objects.push(goodCube2);
    // popableBalloons.push(goodCube2);
    // cubeBox2 = new THREE.Box3().setFromObject(goodCube1);

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

    //container.appendChild(renderer.domElement);

    /* Controls */

    let controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enableRotate = false;

    document.body.onkeyup = function (key) {
        if (key.keyCode == 32) {
            controls.enableRotate ? controls.enableRotate = false : controls.enableRotate = true;
        }
        if (key.keyCode == 87) { //w
            dart.translateY(20);
        }
        if (key.keyCode == 65) { //a
            dart.translateX(-20);
        }
        if (key.keyCode == 83) { //s
            dart.translateY(-20);
        }
        if (key.keyCode == 68) { //d
            dart.translateX(20);
        }
        if (key.keyCode == 82) { //r
            dart.translateZ(20);
        }
        if (key.keyCode == 70) { //f
            dart.translateZ(-20);
        }

    };

    document.body.appendChild( renderer.domElement );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );


}

/**
 * @param event                 The event.
 * @param event.touches         The event's touches array
 * @param event.preventDefault  prevents the default event
 * @param event.clientX         x
 * @param event.clientY         y
 */
function onDocumentTouchStart( event ) {

    event.preventDefault();

    event.clientX = event.touches[0].clientX;
    event.clientY = event.touches[0].clientY;
    onDocumentMouseDown( event );

}

function onDocumentMouseDown( event ) {

    event.preventDefault();

    mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        if(intersects[0].object == mesh) {
            intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
            score--;
            document.getElementById("score").textContent="Score :" + score;
        }
        if(popableBalloons.includes(intersects[0].object)){
            intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
            score++;
            document.getElementById("score").textContent="Score :" + score;
            Console.log("Score: " + score);
        }

        if (score == 10){

            score = 0;

            for (let mesh in popableBalloons) {
                let balloon = popableBalloons[mesh];
                scene.remove(balloon);
            }
            scene.remove(mesh);

            let loader = new THREE.FontLoader();
            loader.load( 'fonts/Immortal_Regular.json', function ( font ) {

                let textGeometry = new THREE.TextGeometry( "You Won!", {

                    font: font,

                    size: 100,
                    height: 30,
                    curveSegments: 20,

                    bevelThickness: 3,
                    bevelSize: 3,
                    bevelEnabled: true

                });

                let textMaterial = new THREE.MeshPhongMaterial(
                    { color: 0xff0000, specular: 0xffffff }
                );

                let text = new THREE.Mesh( textGeometry, textMaterial );
                text.translateX(-370);
                scene.add( text );

            });

           // winner();
        }

        //TODO: Potential code to remove object after clicked
        //scene.remove(intersects[0].object);
        //"move" to trash so that that location won't trigger a collision after object removed
       //let movedObj = intersects[0].object;
        //movedObj.position.set(99999,9999,9999);

    }

}

function update(){

    dartBox.setFromObject(dart);

    for (let i = 0; i < cubeBoxes.length; i++) {
        cubeBoxes[i].setFromObject(popableBalloons[i]);

        if (dartBox.intersectsBox(cubeBoxes[i])) {
            removeObject(popableBalloons[i]);
            updateScore(true);
        }
    }
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
    if (score == 2) {

        score = 0;

        for (let mesh in popableBalloons) {
            let balloon = popableBalloons[mesh];
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

    for (let mesh in popableBalloons) {
        let balloon = popableBalloons[mesh];
        balloon.rotation.x += 0.01;
        balloon.rotation.y += 0.02;
    }
    update();
    renderer.render( scene, camera );

}

