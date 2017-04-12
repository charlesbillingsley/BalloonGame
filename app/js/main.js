
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

    geometry = new THREE.BoxGeometry( 200, 200, 200 );
    material = new THREE.MeshPhongMaterial( { color: 0xff0000} );

    mesh = new THREE.Mesh( geometry, material );
    mesh.translateY(400);
    mesh.translateX(400);
    scene.add( mesh );
    objects.push(mesh);


    cubeGeo = new THREE.BoxGeometry( 200, 200, 200);
    cubeMat = new THREE.MeshPhongMaterial({color: 0xff0000});
    goodCube = new THREE.Mesh( cubeGeo, cubeMat);
    goodCube.translateX(-400);
    goodCube.translateY(400);
    scene.add(goodCube);
    objects.push(goodCube);

    torGeo = new THREE.TorusGeometry(200, 100, 20);
    torMat = new THREE.MeshPhongMaterial({color: 0x00ff00});
    torus = new THREE.Mesh(torGeo, torMat);
    scene.add(torus);
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

        //TODO: Potential code to remove object after clicked
        //scene.remove(intersects[0].object);
        //"move" to trash so that that location won't trigger a collision after object removed
       //var movedObj = intersects[0].object;
        //movedObj.position.set(99999,9999,9999);

    }

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

