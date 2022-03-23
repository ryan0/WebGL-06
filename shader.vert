attribute vec4 a_position;
attribute vec2 a_textureCoord;

uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

varying float v_colorOffset;
varying vec2 v_textureCoord;

void main() {
    v_textureCoord = a_textureCoord;
    v_colorOffset = a_position.w;
    gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position.x, a_position.y, a_position.z, 1.0);
}