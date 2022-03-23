precision highp float;
uniform float u_time;
uniform sampler2D u_sampler;
varying float v_colorOffset;
varying vec2 v_textureCoord;

void main() {
  vec4 texelColor = texture2D(u_sampler, v_textureCoord);
  float change = (sin(u_time + v_colorOffset) + 1.0) / 2.0;
  change = change / (change + .01);
  gl_FragColor = vec4(texelColor.rgb, texelColor.a * change);
}