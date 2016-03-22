(function(exports) {
    "use strict";

    var WIDTH = 400, HEIGHT = 400;

    function point(x, y, z, u, v) {
        return { x: x, y: y, z: z, u: u, v: v };
    }

    var CUBE = [
        point(-1, -1, 1,  0, 0),
        point( 1, -1, 1,  0, 1),
        point( 1,  1, 1,  1, 1),
        point(-1,  1, 1,  1, 0),
        point(-1, -1, -1, 0, 0),
        point( 1, -1, -1, 0, 1),
        point( 1,  1, -1, 1, 1),
        point(-1,  1, -1, 1, 0),
    ];

    var CUBE_FACES = [
        [0, 1, 2, 3],
        [0, 1, 5, 4],
        [4, 5, 6, 7],
        [2, 3, 7, 6],
        [1, 2, 6, 5],
        [0, 3, 7, 4],
    ];

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

    function fetchFile(path) {
        var request = new XMLHttpRequest();
        request.open("GET", path, false);
        request.overrideMimeType('text/plain');
        request.send();
        return request.responseText;
    }

    function loadImage(gl, src) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        var texId = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texId);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        var img = document.createElement('img');
        img.src = src;

        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            gl.bindTexture(gl.TEXTURE_2D, texId);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, imgData.width, imgData.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imgData.data);
        };

        return texId;
    }

    function createProgram(gl, vertFile, fragFile) {
        var vert = fetchFile(vertFile);
        var frag = fetchFile(fragFile);

        var vertShader = compileShader(gl, vert, gl.VERTEX_SHADER);
        var fragShader = compileShader(gl, frag, gl.FRAGMENT_SHADER);

        var prog = gl.createProgram();
        gl.attachShader(prog, vertShader);
        gl.attachShader(prog, fragShader);
        gl.linkProgram(prog);

        prog.positionLocation = gl.getAttribLocation(prog, "a_position");
        prog.uvLocation = gl.getAttribLocation(prog, "a_uv");
        prog.timeLocation = gl.getUniformLocation(prog, "u_time");

        return prog;
    }

    var time = 0;
    function update(gl, prog, model) {
        time++;

        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Update time.
        gl.uniform1i(prog.timeLocation, time);

        gl.useProgram(prog);

        gl.vertexAttribPointer(prog.positionLocation, 3, gl.BYTE, false, 5, 0);
        gl.enableVertexAttribArray(prog.positionLocation);
        gl.vertexAttribPointer(prog.uvLocation, 2, gl.BYTE, false, 5, 3);
        gl.enableVertexAttribArray(prog.uvLocation);

        model.primitives.forEach(function(prim) {
            gl.drawElements(gl.TRIANGLE_STRIP, prim.count, gl.UNSIGNED_BYTE, prim.start);
        });
    }

    function convertPointsToGL(gl, points, faces) {
        var verts = new Int8Array(points.length * 5);
        points.forEach(function(p, i) {
            verts[i*5 + 0] = p.x;
            verts[i*5 + 1] = p.y;
            verts[i*5 + 2] = p.z;
            verts[i*5 + 3] = p.u;
            verts[i*5 + 4] = p.v;
        });

        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        var indxs = new Int8Array(faces.length * 4);
        var primitives = [];
        faces.forEach(function(face, i) {
            indxs[i*4 + 0] = face[0];
            indxs[i*4 + 1] = face[1];
            indxs[i*4 + 2] = face[3];
            indxs[i*4 + 3] = face[2];
            primitives.push({ start: i*4, count: 4 });
        });

        var elementBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indxs, gl.STATIC_DRAW);

        return { primitives: primitives };
    }

    window.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        document.body.appendChild(canvas);
        var gl = canvas.getContext('webgl');
        gl.viewport(0, 0, WIDTH, HEIGHT);

        loadImage(gl, 'crate2.jpg');

        var prog = createProgram(gl, 'c6_vert.glsl', 'c6_frag.glsl');
        var model = convertPointsToGL(gl, CUBE, CUBE_FACES);

        function mainloop() {
            update(gl, prog, model);
            window.requestAnimationFrame(mainloop);
        }

        mainloop();
    };

})(window);
