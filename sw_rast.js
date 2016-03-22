(function(exports) {
    "use strict";

    var WIDTH = 400, HEIGHT = 400;

    var CUBE = [
        { x: -1, y: -1, z: -1, u: 0, v: 0, },
        { x:  1, y: -1, z: -1, u: 1, v: 0, },
        { x:  1, y:  1, z: -1, u: 1, v: 1, },
        { x: -1, y:  1, z: -1, u: 0, v: 1, },

        { x:  1, y: -1, z: -1, u: 0, v: 0, },
        { x:  1, y: -1, z:  1, u: 1, v: 0, },
        { x:  1, y:  1, z:  1, u: 1, v: 1, },
        { x:  1, y:  1, z: -1, u: 0, v: 1, },

        { x:  1, y: -1, z: -1, u: 1, v: 0, },
        { x: -1, y: -1, z: -1, u: 0, v: 0, },
        { x: -1, y: -1, z:  1, u: 0, v: 1, },
        { x:  1, y: -1, z:  1, u: 1, v: 1, },

        { x:  1, y: -1, z:  1, u: 1, v: 0, },
        { x: -1, y: -1, z:  1, u: 0, v: 0, },
        { x: -1, y:  1, z:  1, u: 0, v: 1, },
        { x:  1, y:  1, z:  1, u: 1, v: 1, },

        { x: -1, y: -1, z:  1, u: 1, v: 0, },
        { x: -1, y: -1, z: -1, u: 0, v: 0, },
        { x: -1, y:  1, z: -1, u: 0, v: 1, },
        { x: -1, y:  1, z:  1, u: 1, v: 1, },

        { x: -1, y:  1, z: -1, u: 1, v: 0, },
        { x:  1, y:  1, z: -1, u: 0, v: 0, },
        { x:  1, y:  1, z:  1, u: 0, v: 1, },
        { x: -1, y:  1, z:  1, u: 1, v: 1, },
    ];

    var CUBE_FACES = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11],
        [12, 13, 14, 15],
        [16, 17, 18, 19],
        [20, 21, 22, 23],
    ];

    function renderPoint(ctx, x, y) {
        var S = 4, hs = S/2;
        ctx.fillStyle = '#000';
        ctx.fillRect(x-hs, y-hs, S, S);
    }

    function renderPoints(ctx, points) {
        points.forEach(function(p) {
            renderPoint(ctx, p.x, p.y);
        });
    }

    function edgeFunction(ax, ay, bx, by, px, py) {
        // Put everything in the space of A.
        bx -= ax; by -= ay; px -= ax; py -= ay;
        // Signed area of the paralellogram decided by B and P.
        return (bx * py - by * px);
    }

    function mixColor(c, t) {
        var r = ((c >>> 24) & 0xFF) * t;
        var g = ((c >>> 16) & 0xFF) * t;
        var b = ((c >>>  8) & 0xFF) * t;
        var a = ((c >>>  0) & 0xFF);
        return r << 24 | g << 16 | b << 8 | a;
    }

    function loadImage(src) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var data = null;
        ctx.load = function() {
            if (!data)
                data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
            return data;
        };

        var img = document.createElement('img');
        img.src = src;
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            data = null;
        };

        return ctx;
    }

    var crate = loadImage('crate2.jpg');

    function texture2D(img, u, v) {
        var x = (img.width * u) | 0;
        var y = (img.height * v) | 0;
        var idx = (y * img.width + x) * 4;
        return (img.data[idx + 0] << 24 | img.data[idx + 1] << 16 |
                img.data[idx + 2] <<  8 | img.data[idx + 3]);
    }

    function shadePixel(vtx) {
        // Albedo
        var color = texture2D(crate.load(), vtx.u, vtx.v);

        return color | 0x000000FF;
    }

    function renderTri(buffer, points, i1, i2, i3) {
        // Our three points.
        var P1 = points[i1];
        var P2 = points[i2];
        var P3 = points[i3];

        // Edges.
        var E1x1 = P2.x, E1y1 = P2.y, E1x2 = P3.x, E1y2 = P3.y;
        var E2x1 = P3.x, E2y1 = P3.y, E2x2 = P1.x, E2y2 = P1.y;
        var E3x1 = P1.x, E3y1 = P1.y, E3x2 = P2.x, E3y2 = P2.y;

        // Extremeties.
        var minX = (Math.min(P1.x, P2.x, P3.x) | 0);
        var minY = (Math.min(P1.y, P2.y, P3.y) | 0);
        var maxX = (Math.max(P1.x, P2.x, P3.x) | 0) + 1;
        var maxY = (Math.max(P1.y, P2.y, P3.y) | 0) + 1;

        // Clamp to image bounds.
        minX = Math.max(minX, 0); minY = Math.max(minY, 0);
        maxX = Math.min(maxX, ctx.canvas.width); maxY = Math.min(maxY, ctx.canvas.height);

        // Twice the tri's area.
        var area = (P3.y - P1.y) * (P2.x - P1.x) - (P2.y - P1.y) * (P3.x - P1.x);

        var img = buffer.img;

        for (var y = minY; y < maxY; y++) {
            for (var x = minX; x < maxX; x++) {
                var W1 = edgeFunction(E1x1, E1y1, E1x2, E1y2, x, y);
                var W2 = edgeFunction(E2x1, E2y1, E2x2, E2y2, x, y);
                var W3 = edgeFunction(E3x1, E3y1, E3x2, E3y2, x, y);

                // Inside our tri?
                if (W1 < 0 || W2 < 0 || W3 < 0)
                    continue;

                W1 /= area;
                W2 /= area;
                W3 /= area;

                var vtx = {};
                for (var k in P1)
                    vtx[k] = P1[k]*W1 + P2[k]*W2 + P3[k]*W3;

                // Early depth test.
                // Calculate Z.
                var i = (y * img.width + x);

                if (buffer.depth[i] < vtx.z)
                    continue;

                var p = shadePixel(vtx);

                var idx = i * 4;
                img.data[idx + 0] = (p >>> 24) & 0xFF;
                img.data[idx + 1] = (p >>> 16) & 0xFF;
                img.data[idx + 2] = (p >>> 8) & 0xFF;
                img.data[idx + 3] = p & 0xFF;
                buffer.depth[i] = vtx.z;
            }
        }
    }

    function renderFace(buffer, face, points) {
        // Each face is guaranteed to be a quad.
        if (face.length !== 4) XXX;

        renderTri(buffer, points, face[0], face[1], face[2]);
        renderTri(buffer, points, face[2], face[3], face[0]);
    }

    function memset(b, v) {
        for (var i = 0; i < b.length; i++) b[i] = v;
    }

    function renderModel(buffer, faces, points) {
        // Clear.
        memset(buffer.img.data, 0);
        memset(buffer.depth, 0xFFFF);

        faces.forEach(function(face) { renderFace(buffer, face, points); });
        ctx.putImageData(buffer.img, 0, 0);

        // renderPoints(buffer.ctx, points);
    }

    function copy(o, n) {
        var x = {};
        for (var i in o)
            x[i] = o[i];
        for (var i in n)
            x[i] = n[i];
        return x;
    }

    function rotateX(p, a) {
        var sin = Math.sin(a),
            cos = Math.cos(a);
        var ry = p.y * cos - p.z * sin;
        var rz = p.y * sin + p.z * cos;
        return copy(p, { y: ry, z: rz });
    }

    function rotateY(p, a) {
        var sin = Math.sin(a),
            cos = Math.cos(a);
        var rx =  p.x * cos + p.z * sin;
        var rz = -p.x * sin + p.z * cos;
        return copy(p, { x: rx, z: rz });
    }

    function scalePoint(p, m) {
        return copy(p, { x: p.x * m, y: p.y * m, z: p.z * m });
    }

    function translatePoint(p, tx, ty, tz) {
        return copy(p, { x: p.x + tx, y: p.y + ty, z: p.z + tz });
    }

    function transform(points) {
        points = points.map(function(p) {
            // Make it look cool by rotating it around...
            p = rotateY(p, angle);
            p = rotateX(p, angle * 0.7);

            // So we're not in the immediate center of it.
            p = translatePoint(p, 0, 0, +document.querySelector('#zoff').value);

            // Perspective divide!
            if (p.z <= 0)
                p.z = 0.01;

            p.x /= p.z;
            p.y /= p.z;

            p = scalePoint(p, +document.querySelector('#zoff').value);

            // So we can see the point...
            p = scalePoint(p, 80);
            p = translatePoint(p, 200, 200, 200);

            return p;
        });

        return points;
    }

    var angle = 0.25;

    var buffer = {};
    function init(ctx) {
        buffer.img = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        buffer.depth = new Uint16Array(buffer.img.width * buffer.img.height);
        buffer.ctx = ctx;
    }

    function update(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        angle += 0.02;
        var points = CUBE;
        points = transform(points);
        renderModel(buffer, CUBE_FACES, points);
    }

    window.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        function mainloop() {
            update(ctx);
            window.requestAnimationFrame(mainloop);
        }

        mainloop();
    };

})(window);
