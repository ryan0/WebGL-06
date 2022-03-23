precision mediump float;
uniform mediump float u_time;
varying float colorOffset;

void main() {
  float change = (sin(u_time + colorOffset) + 1.0) / 2.0;
  gl_FragColor = vec4(1.0 * change, 1.0 * change, 1.0 * change, 1);
}