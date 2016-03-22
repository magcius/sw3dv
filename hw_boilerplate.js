(function(exports) {
    "use strict";

    var WIDTH = 400, HEIGHT = 400;

    function point(x, y, z) {
        return { x: x, y: y, z: z };
    }

    var CUBE = [
        point(-1, -1, 1),
        point( 1, -1, 1),
        point( 1,  1, 1),
        point(-1,  1, 1),
        point(-1, -1, -1),
        point( 1, -1, -1),
        point( 1,  1, -1),
        point(-1,  1, -1),
    ];

    var CUBE_FACES = [
        [0, 1, 2, 3],
        [0, 1, 5, 4],
        [4, 5, 6, 7],
        [2, 3, 7, 6],
        [1, 2, 6, 5],
        [0, 3, 7, 4],
    ];

    function fetchFile(filename) {
        var request = new XMLHttpRequest();
        request.open("GET", filename, false);
        request.overrideMimeType('text/plain');
        request.send();
        return request.responseText;
    }

    function compileShader(gl, str, type) {
        var shader = gl.createShader(type);

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var time = 0;
    function update(gl) {
        time++;

        // Clear the scene.
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    window.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        document.body.appendChild(canvas);
        var gl = canvas.getContext('webgl');
        gl.viewport(0, 0, WIDTH, HEIGHT);

        function mainloop() {
            update(gl);
            window.requestAnimationFrame(mainloop);
        }

        mainloop();
    };

})(window);
