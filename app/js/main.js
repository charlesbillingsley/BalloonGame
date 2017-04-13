
let scene, camera, renderer;
let geometry, material, mesh;
let cubeGeo, cubeMat;
let torGeo, torMat, torus;
let mouse, raycaster;
let score;
let gui;
let objects = [];
let popableBalloons = [];

init();
animate();


function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    // geometry = new THREE.BoxGeometry( 50, 50, 50 );
    // material = new THREE.MeshPhongMaterial( { color: 0xff0000} );
    //
    // mesh = new THREE.Mesh( geometry, material );
    // mesh.translateY(-60);
    // mesh.translateX(40);
    // scene.add( mesh );
    // objects.push(mesh);


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
        cubeGeo = new THREE.BoxGeometry(50, 50, 50);
        cubeMat = new THREE.MeshPhongMaterial({color: 0xff0000});
        let goodCube = new THREE.Mesh(cubeGeo, cubeMat);
        goodCube.translateX(Math.floor(Math.random() * (270 - (-270))) + (-270));
        goodCube.translateY(Math.floor(Math.random() * (150 - (-150))) + (-150));
        scene.add(goodCube);
        objects.push(goodCube);
        popableBalloons.push(goodCube);
    }

    torGeo = new THREE.TorusGeometry(200, 100, 20);
    torMat = new THREE.MeshPhongMaterial({color: 0x00ff00});
    torus = new THREE.Mesh(torGeo, torMat);
    //scene.add(torus);
    objects.push(torus);

    const lightOne = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    lightOne.position.set(10, 40, 200);
    scene.add(lightOne);

    //MyWheel = new Wheel(5);
    //scene.add(MyWheel);
    //objects.push(MyWheel);

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

    document.body.onkeyup = function (key) {
        if (key.keyCode == 32) {
            controls.enableRotate ? controls.enableRotate = false : controls.enableRotate = true;
        }
    };

    controls.enableRotate = false;


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
        if(intersects[0].object == torus){
            intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
            score++;
            document.getElementById("score").textContent="Score :" + score;
        }

        if (score == 10){

            score = 0;

            for (let mesh in popableBalloons) {
                let balloon = popableBalloons[mesh];
                scene.remove(balloon);
            }
            scene.remove(torus);
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

// function winner(){
//
//     winScene = new THREE.Scene();
//
//     let loader = new THREE.FontLoader();
//     loader.load( 'fonts/Immortal_Regular.json', function ( font ) {
//
//         let textGeometry = new THREE.TextGeometry( "text", {
//
//             font: font,
//
//             size: 50,
//             height: 10,
//             curveSegments: 12,
//
//             bevelThickness: 1,
//             bevelSize: 1,
//             bevelEnabled: true
//
//         });
//
//         let textMaterial = new THREE.MeshPhongMaterial(
//             { color: 0xff0000, specular: 0xffffff }
//         );
//
//         let mesh = new THREE.Mesh( textGeometry, textMaterial );
//
//         scene.add( mesh );
//
//     });
//
//     renderer = new THREE.WebGLRenderer();
//     renderer.setSize( window.innerWidth, window.innerHeight );
//
//     document.body.appendChild( renderer.domElement );
//
//
// }

function animate() {

    requestAnimationFrame( animate );

    for (let mesh in popableBalloons) {
        let balloon = popableBalloons[mesh];
        balloon.rotation.x += 0.01;
        balloon.rotation.y += 0.02;
    }
    
    renderer.render( scene, camera );

}

