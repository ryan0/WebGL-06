attribute vec4 a_position;

uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

varying float colorOffset;

void main() {
    colorOffset = a_position.w;
    gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position.x, a_position.y, a_position.z, 1.0);
}