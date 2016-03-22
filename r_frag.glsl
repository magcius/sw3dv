
precision mediump float;

varying vec3 v_position;

void main() {
    vec3 color_pos = abs(v_position) / 2.0;
    gl_FragColor = vec4(color_pos.x, color_pos.y, color_pos.z, 0.6);
}
