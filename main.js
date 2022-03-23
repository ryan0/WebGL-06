import { webglUtils } from './webgl-utils.js'

function main () {
    const canvas = document.querySelector('#canvas');
    const gl = canvas.getContext('webgl');
    if(!gl) {
        alert('Unable to initialize WebGL'); 
        return; 
    }

    const vertShaderPromise = fetch('shader.vert').then(file => file.text());
    const fragShaderPromise = fetch('shader.frag').then(file => file.text());
    Promise.all([vertShaderPromise, fragShaderPromise]).then(shaderStrings => {
        const shaderProgram = webglUtils.initShaderProgram(gl, shaderStrings[0], shaderStrings[1])

        const programInfo = {
            positionAttributeLocation: gl.getAttribLocation(shaderProgram, 'a_position'),
            timeUniformLocation: gl.getUniformLocation(shaderProgram, 'u_time'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'u_modelViewMatrix'),
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'u_projectionMatrix'),
        };

        const positionBuffer = initalizePoints(gl);

        gl.useProgram(shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(programInfo.positionAttributeLocation);
        gl.vertexAttribPointer(programInfo.positionAttributeLocation, 4, gl.FLOAT, false, 0, 0);

        gl.uniform1f(programInfo.timeUniformLocation, 0.0);

        resizeCanvas(gl);
        window.addEventListener('resize', () => {
            resizeCanvas(gl)
        });


        startRenderLoop(gl, programInfo);
    })
}


let pressedKeys = {
    W: false,
    S: false,
    D: false,
    A: false
}
window.onkeydown = function(e) {
    if(e.key === 'w') {
        pressedKeys.W = true;
    } else if(e.key === 's') {
        pressedKeys.S = true;
    } else if(e.key === 'd') {
        pressedKeys.D = true;
    } else if(e.key === 'a') {
        pressedKeys.A = true;
    }
}
window.onkeyup = function(e) {
    if(e.key === 'w') {
        pressedKeys.W = false;
    } else if(e.key === 's') {
        pressedKeys.S = false;
    } else if(e.key === 'd') {
        pressedKeys.D = false;
    } else if(e.key === 'a') {
        pressedKeys.A = false;
    }
}
document.getElementById("mobile-forward").ontouchstart = function() {
    pressedKeys.W = true;
}
document.getElementById("mobile-forward").ontouchend = function() {
    pressedKeys.W = false;
}
document.getElementById("mobile-backward").ontouchstart = function() {
    pressedKeys.S = true;
}
document.getElementById("mobile-backward").ontouchend = function() {
    pressedKeys.S = false;
}

function startRenderLoop(gl, programInfo) {
    let startTime;
    let lastTime;
    let position = -5.0;
    let rotation = 0;
    function render(timestamp) {
        if(!startTime) {
            startTime = timestamp;
            lastTime = timestamp;
        }
        const particleTime = (timestamp - startTime) / 1000;
        const delta = timestamp - lastTime;
        lastTime = timestamp;
        console.log(delta);
        
        gl.uniform1f(programInfo.timeUniformLocation, particleTime);

        if(pressedKeys.W) {
            position += .04 * delta;
        } else if(pressedKeys.S) {
            position -= .04 * delta;
        }

        if(pressedKeys.D) {
            rotation += .0002 * delta;
        } else if(pressedKeys.A) {
            rotation -= .0002 * delta;
        }

        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 500.0;

        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    
        const modelViewMatrix = mat4.create();
        mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [0, 1, 0]);
        mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, position]);

        gl.uniformMatrix4fv(
            programInfo.projectionMatrix,
            false,
            projectionMatrix);
        gl.uniformMatrix4fv(
            programInfo.modelViewMatrix,
            false,
            modelViewMatrix);



        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6 * 100000);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function initalizePoints(gl) {
    const positions = [];

    for(let i = 0; i < 100000; i++) {
        const colorOffset = Math.random() * 100;
        const x = (Math.random() * 200) - 100;
        const y = (Math.random() * 200) - 100;
        const z = -1 * Math.random() * 1000;
        const size = Math.random() / 4.0;

        positions.push(0 + x); positions.push(0 + y); positions.push(z); positions.push(colorOffset);
        positions.push(size + x); positions.push(0 + y); positions.push(z); positions.push(colorOffset);
        positions.push(0 + x); positions.push(size + y); positions.push(z); positions.push(colorOffset);

        positions.push(0 + x); positions.push(size + y); positions.push(z); positions.push(colorOffset);
        positions.push(size + x); positions.push(0 + y); positions.push(z); positions.push(colorOffset);
        positions.push(size + x); positions.push(size + y); positions.push(z); positions.push(colorOffset);
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}

function resizeCanvas(gl) {
    gl.canvas.width = gl.canvas.clientWidth;
    gl.canvas.height = gl.canvas.clientHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

main();