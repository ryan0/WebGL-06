import { webglUtils } from './webgl-utils.js'
import { inputHandler } from './input-handler.js'

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

        const programInfo = findProgramLocations(gl, shaderProgram);

        const buffers = initalizePoints(gl);
        const starTex = webglUtils.loadTexture(gl, './star-tex.png');

        gl.useProgram(shaderProgram);

        gl.clearColor(0, 0, 0, 1);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable( gl.BLEND );
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
        gl.enableVertexAttribArray(programInfo.positionAttributeLocation);
        gl.vertexAttribPointer(programInfo.positionAttributeLocation, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoordBuffer);
        gl.vertexAttribPointer(programInfo.textureCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.textureCoordAttributeLocation);

        gl.activeTexture(gl.TEXTURE0); // Tell WebGL we want to affect texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, starTex); // Bind the texture to texture unit 0
        gl.uniform1i(programInfo.uSampler, 0); // Tell the shader we bound the texture to texture unit 0

        gl.uniform1f(programInfo.timeUniformLocation, 0.0);

        resizeCanvas(gl);
        window.addEventListener('resize', () => {
            resizeCanvas(gl)
        });

        startRenderLoop(gl, programInfo);
    })
}


function startRenderLoop(gl, programInfo) {
    let startTime;
    let lastTime;
    let position = -5.0;
    let rotation = 0.0;
    function render(timestamp) {
        if(!startTime) {
            startTime = timestamp;
            lastTime = timestamp;
        }
        const particleTime = (timestamp - startTime) / 1000;
        const delta = timestamp - lastTime;
        lastTime = timestamp;

        if(inputHandler.W) {
            position += .04 * delta;
        } else if(inputHandler.S) {
            position -= .04 * delta;
        }

        if(inputHandler.D) {
            rotation += .0002 * delta;
        } else if(inputHandler.A) {
            rotation -= .0002 * delta;
        }

        calcProjectionView(gl, programInfo, position, rotation);

        gl.uniform1f(programInfo.timeUniformLocation, particleTime);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6 * 500000);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function calcProjectionView(gl, programInfo, position, rotation) {
    const fieldOfView = 45 * Math.PI / 180;   // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 500.0;

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [0, 1, 0]);
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, position]);

    gl.uniformMatrix4fv(programInfo.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.modelViewMatrix, false, modelViewMatrix);
}

function initalizePoints(gl) {
    const positions = [];
    const textureCoordinates = [];

    const clusterPositions = [];

    const spreadWidth = 200;
    const spreadHeight = 200;
    const spreadDepth = 1000;
    const numberClusters = 200;

    for(let i = 0; i < numberClusters; i++) {
        const x = (Math.random() * spreadWidth) - spreadWidth / 2.0;
        const y = (Math.random() * spreadHeight) - spreadHeight / 2.0;
        const z = -1 * Math.random() * spreadDepth;

        clusterPositions.push(vec3.fromValues(x, y, z));
    }

    for(let i = 0; i < 500000; i++) {
        const colorOffset = Math.random() * 100;
        const size = Math.random() * Math.random() * Math.random() * Math.random();
        const x = (Math.random() * spreadWidth) - spreadWidth / 2.0;
        const y = (Math.random() * spreadHeight) - spreadHeight / 2.0;
        const z = -1 * Math.random() * spreadDepth;

        const cluster = Math.floor(Math.random() * numberClusters);

        let pos = vec3.fromValues(x, y, z);
        let dir = vec3.create();
        let dist = vec3.distance(pos, clusterPositions[cluster])
        vec3.subtract(dir, clusterPositions[cluster], pos);
        vec3.normalize(dir, dir);
        vec3.scale(dir, dir, dist / (1.0001 + (Math.random() * Math.random())));
        vec3.add(pos, pos, dir);



        positions.push(0 + pos[0]); positions.push(0 + pos[1]); positions.push(pos[2]); positions.push(colorOffset);
        positions.push(size + pos[0]); positions.push(0 + pos[1]); positions.push(pos[2]); positions.push(colorOffset);
        positions.push(0 + pos[0]); positions.push(size + pos[1]); positions.push(pos[2]); positions.push(colorOffset);

        textureCoordinates.push(0); textureCoordinates.push(0);
        textureCoordinates.push(1); textureCoordinates.push(0);
        textureCoordinates.push(0); textureCoordinates.push(1);

        positions.push(0 + pos[0]); positions.push(size + pos[1]); positions.push(pos[2]); positions.push(colorOffset);
        positions.push(size + pos[0]); positions.push(0 + pos[1]); positions.push(pos[2]); positions.push(colorOffset);
        positions.push(size + pos[0]); positions.push(size + pos[1]); positions.push(pos[2]); positions.push(colorOffset);

        textureCoordinates.push(0); textureCoordinates.push(1);
        textureCoordinates.push(1); textureCoordinates.push(0);
        textureCoordinates.push(1); textureCoordinates.push(1);
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    return { 
        positionBuffer: positionBuffer,
        textureCoordBuffer: textureCoordBuffer
    }
}

function findProgramLocations(gl, shaderProgram) {
    return {
        positionAttributeLocation: gl.getAttribLocation(shaderProgram, 'a_position'),
        textureCoordAttributeLocation: gl.getAttribLocation(shaderProgram, 'a_textureCoord'),
        timeUniformLocation: gl.getUniformLocation(shaderProgram, 'u_time'),
        uSampler: gl.getUniformLocation(shaderProgram, 'u_sampler'),
        modelViewMatrix: gl.getUniformLocation(shaderProgram, 'u_modelViewMatrix'),
        projectionMatrix: gl.getUniformLocation(shaderProgram, 'u_projectionMatrix'),
    };
}

function resizeCanvas(gl) {
    gl.canvas.width = gl.canvas.clientWidth;
    gl.canvas.height = gl.canvas.clientHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

main();