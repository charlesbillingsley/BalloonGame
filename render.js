/**
 * Created by:
 * Charles Billingsley
 * Chris Fracassi
 *
 * Adapted from code given from Hans Dulimarta
 */
let canvas;
let orthoProjMat, persProjMat, viewMat, topViewMat, frontViewMat, rightViewMat, tmpMat, cameraCF, normalMat;
let currentCameraView = "3D";
var posAttr, colAttr, normAttr;
let modelUnif, viewUnif, projUnif, pointLight;
const IDENTITY = mat4.create();
let linebuff;
let lightPos;
let gl;
let lightPosUnif;
let cameraObjArr = [];
let tableObjArr = [];
let screenObjArr = [];
let cameraObjFrames = [];
let tableObjFrames = [];
let screenObjFrames = [];
let cameraObjSelect, tableObjSelect, screenObjSelect;
let numOfCameraObjs, mostRecentNumOfCameraObjs;
let numOfTableObjs, mostRecentNumOfTableObjs;
let numOfScreenObjs, mostRecentNumOfScreenObjs;
let textOut;
let shouldAnimate = false;
let paused = false;
let forward = true;
let timeStamp, timeStart;
let speed = 10;

let normalUnif, useLightingUnif, objTintUnif, ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif, lightCF;

function main() {
  canvas = document.getElementById("gl-canvas");
  textOut = document.getElementById("message");
  gl = WebGLUtils.setupWebGL(canvas, null);

  /* setup window resize listener */
  window.addEventListener('resize', resizeWindow);
  window.addEventListener("keydown", keyboardHandler, false);

  let lightxslider = document.getElementById("lightx");
  let lightyslider = document.getElementById("lighty");
  let lightzslider = document.getElementById("lightz");
  lightxslider.addEventListener('input', lightPosChanged, false);
  lightyslider.addEventListener('input', lightPosChanged, false);
  lightzslider.addEventListener('input', lightPosChanged, false);

  ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
  .then (prog => {
    /* put all one-time initialization logic here */
    gl.useProgram (prog);
    gl.clearColor (1, 0.5, .5, 1);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    posAttr = gl.getAttribLocation (prog, "vertexPos");
    colAttr = gl.getAttribLocation (prog, "vertexCol");
    normAttr = gl.getAttribLocation(prog, "vertexNormal");
    lightPosUnif = gl.getUniformLocation(prog, "lightPosWorld");
    projUnif = gl.getUniformLocation(prog, "projection");
    viewUnif = gl.getUniformLocation(prog, "view");
    modelUnif = gl.getUniformLocation (prog, "modelCF");
    normalUnif = gl.getUniformLocation(prog, "normalMat");
    useLightingUnif = gl.getUniformLocation (prog, "useLighting");
    objTintUnif = gl.getUniformLocation(prog, "objectTint");
    ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
    diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
    specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
    shininessUnif = gl.getUniformLocation(prog, "shininess");
    gl.enableVertexAttribArray (posAttr);
    gl.enableVertexAttribArray (normAttr);
    //gl.enableVertexAttribArray(colAttr);
    orthoProjMat = mat4.create();
    persProjMat = mat4.create();
    viewMat = mat4.create();
    topViewMat = mat4.create();
    frontViewMat = mat4.create();
    rightViewMat = mat4.create();
    cameraCF = mat4.create();
    tmpMat = mat4.create();
    normalMat = mat3.create();
    lightCF = mat4.create();

    lightPos = vec3.fromValues(0, 2, 2);
    mat4.fromTranslation(lightCF, lightPos);
    lightx.value = lightPos[0];
    lighty.value = lightPos[1];
    lightz.value = lightPos[2];
    gl.uniform3fv(lightPosUnif,lightPos);


      let vertices = [0, 0, 0, 1, 1, 1,
          lightPos[0], 0, 0, 1, 1, 1,
          lightPos[0], lightPos[1], 0, 1, 1, 1,
          lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
      linebuff = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, linebuff);
      gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);


      mat4.lookAt(viewMat,
      vec3.fromValues(2, 2, 2), /* eye */
      vec3.fromValues(0, 0, 0), /* focal point */
      vec3.fromValues(0, 0, 1)  /* up */
    );

    mat4.lookAt(topViewMat,
      vec3.fromValues(0,0,2),
      vec3.fromValues(0,0,0),
      vec3.fromValues(0,1,0)
    );

      mat4.lookAt(frontViewMat,
          vec3.fromValues(0,2,0),
          vec3.fromValues(0,0,0),
          vec3.fromValues(0,0,1)
      );

      mat4.lookAt(rightViewMat,
          vec3.fromValues(2,0,0),
          vec3.fromValues(0,0,0),
          vec3.fromValues(0,0,1)
      );

    gl.uniformMatrix4fv(modelUnif, false, cameraCF);
    //gl.uniform4fv(normAttr, [0.2, 0.2, 0.2, 0.5]);
    //gl.uniform3fv(lightDirection, [1, 0.5, 0.2]);

      objTint = vec3.fromValues(.3, .3, .5);
      gl.uniform3fv(objTintUnif, objTint);
      gl.uniform1f(ambCoeffUnif, .3);
      gl.uniform1f(diffCoeffUnif, 1);
      gl.uniform1f(specCoeffUnif, 1);
      gl.uniform1f(shininessUnif, 1);

    numOfCameraObjs = document.getElementById("numOfCameraObjs");
    mostRecentNumOfCameraObjs = -1;
    numOfTableObjs = document.getElementById("numOfTableObjs");
    mostRecentNumOfTableObjs = -1;
    numOfScreenObjs = document.getElementById("numOfScreenObjs");
    mostRecentNumOfScreenObjs = -1;

    createCameraObjs();
    createTableObjs();
    createScreenObjs();

    /* calculate viewport */
    resizeWindow();

    timeStamp = Date.now();

      let yellow = vec3.fromValues (0xe7/255, 0xf2/255, 0x4d/255);
      pointLight = new Sphere(gl, .03, 10, 1, 1);

    /* initiate the render loop */
    render();
  });
}


function lightPosChanged(ev) {
    switch (ev.target.id) {
        case 'lightx':
            lightPos[0] = ev.target.value;
            console.log(lightPos[0]);
            break;
        case 'lighty':
            lightPos[1] = ev.target.value;
            console.log(lightPos[1]);

            break;
        case 'lightz':
            lightPos[2] = ev.target.value;
            console.log(lightPos[2]);

            break;
    }
    mat4.fromTranslation(lightCF, lightPos);
    gl.uniform3fv (lightPosUnif, lightPos);
}

function createCameraObjs() {
    shouldAnimate = false;
    paused = false;
    forward = true;
    if (numOfCameraObjs.value < 0) {
        textOut.innerHTML = "Number Cannot be Negative.";
    } else if (numOfCameraObjs.value != mostRecentNumOfCameraObjs) {
        textOut.innerHTML = "";
        // Load the objects
        let xPos;
        let yPos;
        cameraObjArr = [];
        cameraObjFrames = [];
        for (let i = 0; i < numOfCameraObjs.value; i++) {
            if (i == 0) {
                xPos = 0;
                yPos = -1.5;

                cameraObjArr[i] = new Camera(gl);
                cameraObjFrames[i] = mat4.create();

                mat4.fromTranslation(cameraObjFrames[i], vec3.fromValues(xPos, yPos, 0));
                mat4.rotateZ(cameraObjFrames[i], cameraObjFrames[i], Math.PI/4);
                mat4.multiply(cameraObjFrames[i], cameraCF, cameraObjFrames[i]);

            } else if (i == 1) {
                xPos = .6;
                yPos = 0;

                cameraObjArr[i] = new Camera(gl);
                cameraObjFrames[i] = mat4.create();

                mat4.fromTranslation(cameraObjFrames[i], vec3.fromValues(xPos, yPos, 0));
                mat4.rotateZ(cameraObjFrames[i], cameraObjFrames[i], Math.PI/2);
                mat4.multiply(cameraObjFrames[i], cameraCF, cameraObjFrames[i]);

            } else if (i == 2) {
                xPos = 0;
                yPos = 1.5;

                cameraObjArr[i] = new Camera(gl);
                cameraObjFrames[i] = mat4.create();

                mat4.fromTranslation(cameraObjFrames[i], vec3.fromValues(xPos, yPos, 0));
                mat4.rotateZ(cameraObjFrames[i], cameraObjFrames[i], 3*Math.PI/4);
                mat4.multiply(cameraObjFrames[i], cameraCF, cameraObjFrames[i]);

            } else {
                cameraObjArr[i] = new Camera(gl);
                cameraObjFrames[i] = mat4.create();
            }
        }
        /* Fill in the drop down box. */
        populateDropDown("camera");
    }
}

function createTableObjs() {
    if (numOfTableObjs.value < 0) {
        textOut.innerHTML = "Number Cannot be Negative.";
    } else if (numOfTableObjs.value != mostRecentNumOfTableObjs) {
        textOut.innerHTML = "";
        // Load the objects
        let xPos = -1.5;
        let yPos = 0;
        tableObjArr = [];
        tableObjFrames = [];
        for (let i = 0; i < numOfTableObjs.value; i++) {
            tableObjArr[i] = new Table(gl);
            tableObjFrames[i] = mat4.create();
            mat4.fromTranslation(tableObjFrames[i], vec3.fromValues(xPos, yPos, 0));
            mat4.multiply(tableObjFrames[i], cameraCF, tableObjFrames[i]);
        }
        /* Fill in the drop down box. */
        populateDropDown("table");
    }
}

function createScreenObjs() {
    if (numOfScreenObjs.value < 0) {
        textOut.innerHTML = "Number Cannot be Negative.";
    } else if (numOfScreenObjs.value != mostRecentNumOfScreenObjs) {
        textOut.innerHTML = "";
        // Load the objects
        let xPos = -3;
        let yPos = 0;
        screenObjArr = [];
        screenObjFrames = [];
        for (let i = 0; i < numOfScreenObjs.value; i++) {
            screenObjArr[i] = new GreenScreen(gl);
            screenObjFrames[i] = mat4.create();
            mat4.fromTranslation(screenObjFrames[i], vec3.fromValues(xPos, yPos, 0));
            mat4.multiply(screenObjFrames[i], cameraCF, screenObjFrames[i]);
        }
        /* Fill in the drop down box. */
        populateDropDown("screen");
    }
}

function generateManyCameras() {
    numOfCameraObjs.value = 1000;
    textOut.innerHTML = "";
    let xPos = -.8;
    let yPos = -.8;
    cameraObjArr = [];
    cameraObjFrames = [];
    for (let i = 0; i < numOfCameraObjs.value; i++) {
        cameraObjArr[i] = new Camera(gl);
        cameraObjFrames[i] = mat4.create();
        mat4.fromTranslation(cameraObjFrames[i], vec3.fromValues(xPos, yPos, 0));
        mat4.multiply(cameraObjFrames[i], cameraCF, cameraObjFrames[i]);

        var posOrNeg = Math.random() < 0.5 ? -1 : 1;
        xPos += Math.random();
        yPos += Math.random();
        xPos *= posOrNeg;
        yPos *= posOrNeg;
    }

    /* Fill in the drop down box. */
    populateDropDown("camera");
}

function populateDropDown(obj) {
    if (obj == "camera") {
        let fragment = document.createDocumentFragment();
        cameraObjSelect = document.getElementById("cameraObjSelect");
        cameraObjSelect.innerHTML = "";
        cameraObjFrames.forEach(function (currObjFrame, i) {
            let option = document.createElement("option");
            option.innerHTML = "Camera #" + i;
            option.value = i;
            option.id = "Object" + i;
            fragment.appendChild(option);
        });
        cameraObjSelect.appendChild(fragment);
    } else if (obj == "table") {
        let fragment = document.createDocumentFragment();
        tableObjSelect = document.getElementById("tableObjSelect");
        tableObjSelect.innerHTML = "";
        tableObjFrames.forEach(function (currObjFrame, i) {
            let option = document.createElement("option");
            option.innerHTML = "Table #" + i;
            option.value = i;
            option.id = "Object" + i;
            fragment.appendChild(option);
        });
        tableObjSelect.appendChild(fragment);
    } else if (obj == "screen") {
        let fragment = document.createDocumentFragment();
        screenObjSelect = document.getElementById("screenObjSelect");
        screenObjSelect.innerHTML = "";
        screenObjFrames.forEach(function (currObjFrame, i) {
            let option = document.createElement("option");
            option.innerHTML = "Screen #" + i;
            option.value = i;
            option.id = "Object" + i;
            fragment.appendChild(option);
        });
        screenObjSelect.appendChild(fragment);
    }
}

function drawScene() {
    //gl.enableVertexAttribArray(normAttr);
    gl.uniform3f(objTintUnif, 1, 1, 1);
    for (let k = 0; k < cameraObjArr.length; k++) {
        mat3.normalFromMat4 (normalMat, cameraObjFrames[k]);
        gl.uniformMatrix3fv (normalUnif, false, normalMat);
        cameraObjArr[k].draw(posAttr, normAttr, modelUnif, cameraObjFrames[k]);
    }
    gl.uniform3f(objTintUnif, 1, .5, .8);

    for (let j = 0; j < tableObjArr.length; j++) {
        mat3.normalFromMat4 (normalMat, tableObjFrames[j]);
        gl.uniformMatrix3fv (normalUnif, false, normalMat);
        tableObjArr[j].draw(posAttr, normAttr, modelUnif, tableObjFrames[j]);

    }
    gl.uniform3f(objTintUnif, 0, 1, 0);

    for (let l = 0; l < screenObjArr.length; l++) {
        mat3.normalFromMat4 (normalMat, screenObjFrames[l]);
        gl.uniformMatrix3fv (normalUnif, false, normalMat);
        screenObjArr[l].draw(posAttr,  normAttr, modelUnif, screenObjFrames[l]);

    }

    pointLight.draw(posAttr, normAttr, modelUnif, lightCF);

    /* Use LINE_STRIP to mark light position */
    gl.uniformMatrix4fv(modelUnif, false, IDENTITY);
    gl.bindBuffer(gl.ARRAY_BUFFER, linebuff);
    gl.vertexAttribPointer(posAttr, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colAttr, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.LINE_STRIP, 0, 4);



}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, viewMat);
    mat4.mul(tmpMat, viewMat, cameraObjFrames[0]);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(0, 0, canvas.width, canvas.height);
    drawScene();
}

function drawTopView() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
    gl.uniformMatrix4fv(viewUnif, false, topViewMat);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(0, 0, canvas.width, canvas.height);
    drawScene();
}

function drawFrontView() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
    gl.uniformMatrix4fv(viewUnif, false, frontViewMat);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(0, 0, canvas.width, canvas.height);
    drawScene();
}

function drawRightView() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
    gl.uniformMatrix4fv(viewUnif, false, rightViewMat);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(0, 0, canvas.width, canvas.height);
    drawScene();
}

function moveView(currentCameraView, command) {
    let currMat;
    /* The Matrices to Move */
    const transXpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( .5, 0, 0));
    const transXneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(-.5, 0, 0));
    const transYpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, .5, 0));
    const transYneg = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0,-.5, 0));
    const transZpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0, .5));
    const transZneg = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0,-.5));

    switch (currentCameraView) {
        case "3D":
            currMat = viewMat;
            break;
        case "Top":
            currMat = topViewMat;
            break;
        case "Front":
            currMat = frontViewMat;
            break;
        case "Right":
            currMat = rightViewMat;
            break;
        default:
            break;
    }
    switch (command) {
        case "s":
            mat4.rotateX(currMat, currMat, Math.PI/180);
            break;
        case "S":
            mat4.rotateX(currMat, currMat, -Math.PI/180);
            break;
        case "d":
            mat4.rotateY(currMat, currMat, Math.PI/180);
            break;
        case "D":
            mat4.rotateY(currMat, currMat, -Math.PI/180);
            break;
        case "f":
            mat4.rotateZ(currMat, currMat, Math.PI/180);
            break;
        case "F":
            mat4.rotateZ(currMat, currMat, -Math.PI/180);
            break;
        case "w":
            mat4.multiply(currMat, transXneg, currMat);
            break;
        case "W":
            mat4.multiply(currMat, transXpos, currMat);
            break;
        case "e":
            mat4.multiply(currMat, transYneg, currMat);
            break;
        case "E":
            mat4.multiply(currMat, transYpos, currMat);
            break;
        case "r":
            mat4.multiply(currMat, transZneg, currMat);
            break;
        case "R":
            mat4.multiply(currMat, transZpos, currMat);
            break;
    }
}


function render() {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  switch (currentCameraView) {
      case "3D":
          draw3D();
          break;
      case "Top":
          drawTopView();
          break;
      case "Front":
          drawFrontView();
          break;
      case "Right":
          drawRightView();
          break;
      default:
          draw3D();
          break;
  }

  if (shouldAnimate) {
      let now = Date.now();
      if (now/1000 - timeStart/1000 <= 1) {
          let elapse = (now - timeStamp) / 1000;
          /* convert to second */
          timeStamp = now;
          let spinAngle = -elapse * (speed/60) * Math.PI;
          let camera = cameraObjArr[cameraObjSelect.value];

          // Spin lens
          mat4.rotateZ(camera.lensTransform, camera.lensTransform, spinAngle * 2);

          let cameraFrame;

          if (forward) {
              // Spin Wheels
              mat4.rotateZ(camera.triWheel1Transform, camera.triWheel1Transform, spinAngle);
              mat4.rotateZ(camera.triWheel2Transform, camera.triWheel2Transform, spinAngle);
              mat4.rotateZ(camera.triWheel3Transform, camera.triWheel3Transform, spinAngle);
              mat4.rotateZ(camera.triWheel4Transform, camera.triWheel4Transform, spinAngle);

              // Translate camera
              cameraFrame = cameraObjSelect.value;
              const transXneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(spinAngle, 0, 0));
              mat4.multiply(cameraObjFrames[cameraFrame], transXneg, cameraObjFrames[cameraFrame]);
          } else {
              // Spin Wheels
              mat4.rotateZ(camera.triWheel1Transform, camera.triWheel1Transform, -spinAngle);
              mat4.rotateZ(camera.triWheel2Transform, camera.triWheel2Transform, -spinAngle);
              mat4.rotateZ(camera.triWheel3Transform, camera.triWheel3Transform, -spinAngle);
              mat4.rotateZ(camera.triWheel4Transform, camera.triWheel4Transform, -spinAngle);

              // Translate camera
              cameraFrame = cameraObjSelect.value;
              const transXpos = mat4.fromTranslation(mat4.create(), vec3.fromValues(-spinAngle, 0, 0));
              mat4.multiply(cameraObjFrames[cameraFrame], transXpos, cameraObjFrames[cameraFrame]);
          }

      } else {
          shouldAnimate = false;
          paused = false;
          forward ? forward = false : forward = true;
      }
  }
  requestAnimationFrame(render);
}

function resizeWindow() {
    canvas.width = window.innerWidth;
    canvas.height = 0.9 * window.innerHeight;
    if (canvas.width > canvas.height) { /* landscape */
        let ratio = canvas.height / canvas.width;
        console.log("Landscape mode, ratio is " + ratio);
        mat4.ortho(orthoProjMat, -3, 3, -3 * ratio, 3 * ratio, -5, 5);
        mat4.perspective(persProjMat,
            Math.PI/3,  /* 60 degrees vertical field of view */
            1/ratio,    /* must be width/height ratio */
            1,          /* near plane at Z=1 */
            20);        /* far plane at Z=20 */
    } else {
        alert("Window is too narrow!");
    }

}

function keyboardHandler(event) {
    switch (event.key) {
        case "1":
            currentCameraView = "3D";
            render();
            break;
        case "2":
            currentCameraView = "Top";
            render();
            break;
        case "3":
            currentCameraView = "Front";
            render();
            break;
        case "4":
            currentCameraView = "Right";
            render();
            break;
        case "p":
            if (shouldAnimate) {
                shouldAnimate = false;
                paused = true;
            } else {
                shouldAnimate = true;
                timeStart = Date.now();
                timeStamp = Date.now();
            }
            render();
            break;
        case "o":
            speed += 10;
            break;
        case "i":
            speed -= 10;
            break;
        case "x":
            moveSelectedObject("x");
            break;
        case "X":
            moveSelectedObject("X");
            break;
        case "y":
            moveSelectedObject("y");
            break;
        case "Y":
            moveSelectedObject("Y");
            break;
        case "z":
            moveSelectedObject("z");
            break;
        case "Z":
            moveSelectedObject("Z");
            break;
        case "a":
            rotateSelectedObject("a");
            break;
        case "A":
            rotateSelectedObject("A");
            break;
        case "b":
            rotateSelectedObject("b");
            break;
        case "B":
            rotateSelectedObject("B");
            break;
        case "c":
            rotateSelectedObject("c");
            break;
        case "C":
            rotateSelectedObject("C");
            break;
        case "s":
            moveView(currentCameraView, "s");
            break;
        case "S":
            moveView(currentCameraView, "S");
            break;
        case "d":
            moveView(currentCameraView, "d");
            break;
        case "D":
            moveView(currentCameraView, "D");
            break;
        case "f":
            moveView(currentCameraView, "f");
            break;
        case "F":
            moveView(currentCameraView, "F");
            break;
        case "w":
            moveView(currentCameraView, "w");
            break;
        case "W":
            moveView(currentCameraView, "W");
            break;
        case "e":
            moveView(currentCameraView, "e");
            break;
        case "E":
            moveView(currentCameraView, "E");
            break;
        case "r":
            moveView(currentCameraView, "r");
            break;
        case "R":
            moveView(currentCameraView, "R");
            break;
    }
}

function moveSelectedObject(command) {

    /* The type of the object to be moved*/
    let selectedObjType;
    /* The currently selected object */
    let currentFrame;
    if (document.getElementById("moveCameraRadio").checked) {
        selectedObjType = "camera";
        currentFrame = cameraObjSelect.value;
    } else if (document.getElementById("moveTableRadio").checked) {
        selectedObjType = "table";
        currentFrame = tableObjSelect.value;
    } else if (document.getElementById("moveScreenRadio").checked) {
        selectedObjType = "screen";
        currentFrame = screenObjSelect.value;
    }

    /* The Matrices to Move */
    const transXpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( .5, 0, 0));
    const transXneg = mat4.fromTranslation(mat4.create(), vec3.fromValues(-.5, 0, 0));
    const transYpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, .5, 0));
    const transYneg = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0,-.5, 0));
    const transZpos = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0, .5));
    const transZneg = mat4.fromTranslation(mat4.create(), vec3.fromValues( 0, 0,-.5));

    if (selectedObjType == "camera") {
        switch (command) {
            case "x":
                mat4.multiply(cameraObjFrames[currentFrame], transXneg, cameraObjFrames[currentFrame]);
                break;
            case "X":
                mat4.multiply(cameraObjFrames[currentFrame], transXpos, cameraObjFrames[currentFrame]);
                break;
            case "y":
                mat4.multiply(cameraObjFrames[currentFrame], transYneg, cameraObjFrames[currentFrame]);
                break;
            case "Y":
                mat4.multiply(cameraObjFrames[currentFrame], transYpos, cameraObjFrames[currentFrame]);
                break;
            case "z":
                mat4.multiply(cameraObjFrames[currentFrame], transZneg, cameraObjFrames[currentFrame]);
                break;
            case "Z":
                mat4.multiply(cameraObjFrames[currentFrame], transZpos, cameraObjFrames[currentFrame]);
                break;
        }
    } else if (selectedObjType == "table") {
        switch (command) {
            case "x":
                mat4.multiply(tableObjFrames[currentFrame], transXneg, tableObjFrames[currentFrame]);
                break;
            case "X":
                mat4.multiply(tableObjFrames[currentFrame], transXpos, tableObjFrames[currentFrame]);
                break;
            case "y":
                mat4.multiply(tableObjFrames[currentFrame], transYneg, tableObjFrames[currentFrame]);
                break;
            case "Y":
                mat4.multiply(tableObjFrames[currentFrame], transYpos, tableObjFrames[currentFrame]);
                break;
            case "z":
                mat4.multiply(tableObjFrames[currentFrame], transZneg, tableObjFrames[currentFrame]);
                break;
            case "Z":
                mat4.multiply(tableObjFrames[currentFrame], transZpos, tableObjFrames[currentFrame]);
                break;
        }
    } else if (selectedObjType == "screen") {
        switch (command) {
            case "x":
                mat4.multiply(screenObjFrames[currentFrame], transXneg, screenObjFrames[currentFrame]);
                break;
            case "X":
                mat4.multiply(screenObjFrames[currentFrame], transXpos, screenObjFrames[currentFrame]);
                break;
            case "y":
                mat4.multiply(screenObjFrames[currentFrame], transYneg, screenObjFrames[currentFrame]);
                break;
            case "Y":
                mat4.multiply(screenObjFrames[currentFrame], transYpos, screenObjFrames[currentFrame]);
                break;
            case "z":
                mat4.multiply(screenObjFrames[currentFrame], transZneg, screenObjFrames[currentFrame]);
                break;
            case "Z":
                mat4.multiply(screenObjFrames[currentFrame], transZpos, screenObjFrames[currentFrame]);
                break;
        }
    }
}

function rotateSelectedObject(command) {
    /* The type of the object to be moved*/
    let selectedObjType;
    /* The currently selected object */
    let currentFrame;
    if (document.getElementById("moveCameraRadio").checked) {
        selectedObjType = "camera";
        currentFrame = cameraObjSelect.value;
    } else if (document.getElementById("moveTableRadio").checked) {
        selectedObjType = "table";
        currentFrame = tableObjSelect.value;
    } else if (document.getElementById("moveScreenRadio").checked) {
        selectedObjType = "screen";
        currentFrame = screenObjSelect.value;
    }

    if (selectedObjType == "camera") {
        switch (command) {
            case "a":
                mat4.rotateX(cameraObjFrames[currentFrame], cameraObjFrames[currentFrame], Math.PI / 180);
                break;
            case "A":
                mat4.rotateX(cameraObjFrames[currentFrame], cameraObjFrames[currentFrame], -Math.PI / 180);
                break;
            case "b":
                mat4.rotateY(cameraObjFrames[currentFrame], cameraObjFrames[currentFrame], Math.PI / 180);
                break;
            case "B":
                mat4.rotateY(cameraObjFrames[currentFrame], cameraObjFrames[currentFrame], -Math.PI / 180);
                break;
            case "c":
                mat4.rotateZ(cameraObjFrames[currentFrame], cameraObjFrames[currentFrame], Math.PI / 180);
                break;
            case "C":
                mat4.rotateZ(cameraObjFrames[currentFrame], cameraObjFrames[currentFrame], -Math.PI / 180);
                break;
        }
    } else if (selectedObjType == "table") {
        switch (command) {
            case "a":
                mat4.rotateX(tableObjFrames[currentFrame], tableObjFrames[currentFrame], Math.PI / 180);
                break;
            case "A":
                mat4.rotateX(tableObjFrames[currentFrame], tableObjFrames[currentFrame], -Math.PI / 180);
                break;
            case "b":
                mat4.rotateY(tableObjFrames[currentFrame], tableObjFrames[currentFrame], Math.PI / 180);
                break;
            case "B":
                mat4.rotateY(tableObjFrames[currentFrame], tableObjFrames[currentFrame], -Math.PI / 180);
                break;
            case "c":
                mat4.rotateZ(tableObjFrames[currentFrame], tableObjFrames[currentFrame], Math.PI / 180);
                break;
            case "C":
                mat4.rotateZ(tableObjFrames[currentFrame], tableObjFrames[currentFrame], -Math.PI / 180);
                break;
        }
    } else if (selectedObjType == "screen") {
        switch (command) {
            case "a":
                mat4.rotateX(screenObjFrames[currentFrame], screenObjFrames[currentFrame], Math.PI / 180);
                break;
            case "A":
                mat4.rotateX(screenObjFrames[currentFrame], screenObjFrames[currentFrame], -Math.PI / 180);
                break;
            case "b":
                mat4.rotateY(screenObjFrames[currentFrame], screenObjFrames[currentFrame], Math.PI / 180);
                break;
            case "B":
                mat4.rotateY(screenObjFrames[currentFrame], screenObjFrames[currentFrame], -Math.PI / 180);
                break;
            case "c":
                mat4.rotateZ(screenObjFrames[currentFrame], screenObjFrames[currentFrame], Math.PI / 180);
                break;
            case "C":
                mat4.rotateZ(screenObjFrames[currentFrame], screenObjFrames[currentFrame], -Math.PI / 180);
                break;
        }
    }
}
