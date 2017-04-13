
var scene, camera, renderer;
var geometry, material, mesh;
var cubeGeo, cubeMat, goodCube;
var torGeo, torMat, torus;
var mouse, raycaster;
var score;
var gui;
var objects = [];

init();
animate();


function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    geometry = new THREE.BoxGeometry( 2, 2, 2 );
    material = new THREE.MeshPhongMaterial( { color: 0xff0000} );

    mesh = new THREE.Mesh( geometry, material );
    mesh.translateY(-4);
    mesh.translateX(4);
    mesh.translateZ(955);
    scene.add( mesh );
    objects.push(mesh);


    /* Balloon Stand Model */

    var loader = new THREE.ObjectLoader();
    loader.load("Models/stand.json",function ( object ) {
        object.scale.set( 300, 300, 300 );
        //object.translateX(-400);
        object.translateY(-20);
        object.translateZ(950);
        object.rotateY(1.6);
        scene.add( object );
    });

    cubeGeo = new THREE.BoxGeometry( 2, 2, 2);
    cubeMat = new THREE.MeshPhongMaterial({color: 0xff0000});
    goodCube = new THREE.Mesh( cubeGeo, cubeMat);
    goodCube.translateX(4);
    goodCube.translateY(3);
    goodCube.translateZ(955);
    scene.add(goodCube);
    objects.push(goodCube);

    torGeo = new THREE.TorusGeometry(200, 100, 20);
    torMat = new THREE.MeshPhongMaterial({color: 0x00ff00});
    torus = new THREE.Mesh(torGeo, torMat);
    //scene.add(torus);
    objects.push(torus);

    const lightOne = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    lightOne.position.set(10, 40, 100);
    scene.add(lightOne);

    //MyWheel = new Wheel(5);
    //scene.add(MyWheel);
    //objects.push(MyWheel);

    score = 0;

    gui = new dat.GUI({
        height: 100
    });
    var parameters =
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

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = false;


    document.body.appendChild( renderer.domElement );

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );


}

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

    var intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
        if(intersects[0].object == mesh) {
            intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
            score--;
            document.getElementById("score").textContent="Score :" + score;
        }
        if(intersects[0].object == goodCube){
            intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
            score++;
            document.getElementById("score").textContent="Score :" + score;
            console.log("Score: " + score);
        }
        if(intersects[0].object == torus){
            intersects[0].object.material.color.setHex(Math.random() * 0xffffff);
            score++;
            document.getElementById("score").textContent="Score :" + score;
        }

        if (score == 10){

            score = 0;

            scene.remove(goodCube);
            scene.remove(torus);
            scene.remove(mesh);

            var loader = new THREE.FontLoader();
            loader.load( 'fonts/Immortal_Regular.json', function ( font ) {

                var textGeometry = new THREE.TextGeometry( "You Won!", {

                    font: font,

                    size: 100,
                    height: 30,
                    curveSegments: 20,

                    bevelThickness: 3,
                    bevelSize: 3,
                    bevelEnabled: true

                });

                var textMaterial = new THREE.MeshPhongMaterial(
                    { color: 0xff0000, specular: 0xffffff }
                );

                var text = new THREE.Mesh( textGeometry, textMaterial );

                scene.add( text );

            });

           // winner();
        }

        //TODO: Potential code to remove object after clicked
        //scene.remove(intersects[0].object);
        //"move" to trash so that that location won't trigger a collision after object removed
       //var movedObj = intersects[0].object;
        //movedObj.position.set(99999,9999,9999);

    }

}

function winner(){

    winScene = new THREE.Scene();

    var loader = new THREE.FontLoader();
    loader.load( 'fonts/Immortal_Regular.json', function ( font ) {

        var textGeometry = new THREE.TextGeometry( "text", {

            font: font,

            size: 50,
            height: 10,
            curveSegments: 12,

            bevelThickness: 1,
            bevelSize: 1,
            bevelEnabled: true

        });

        var textMaterial = new THREE.MeshPhongMaterial(
            { color: 0xff0000, specular: 0xffffff }
        );

        var mesh = new THREE.Mesh( textGeometry, textMaterial );

        scene.add( mesh );

    });

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );


}

function animate() {

    requestAnimationFrame( animate );

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    goodCube.rotation.x += 0.01;
    goodCube.rotation.y +=0.02;

    torus.rotation.x += 0.01;
    torus.rotation.y += 0.02;
    renderer.render( scene, camera );

}

