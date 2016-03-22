(function(exports) {
    "use strict";

    var CUBE = [
        { x: -1, y: -1, z: -1 },
        { x:  1, y: -1, z: -1 },
        { x:  1, y:  1, z: -1 },
        { x: -1, y:  1, z: -1 },
        { x:  1, y: -1, z:  1 },
        { x: -1, y: -1, z:  1 },
        { x: -1, y:  1, z:  1 },
        { x:  1, y:  1, z:  1 },
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

    function renderModel(buffer, faces, points) {
        renderPoints(buffer.ctx, points);
    }

    function rotateX(p, a) {
        var sin = Math.sin(a),
            cos = Math.cos(a);
        var ry = p.y * cos - p.z * sin;
        var rz = p.y * sin + p.z * cos;
        return { x: p.x, y: ry, z: rz };
    }

    function rotateY(p, a) {
        var sin = Math.sin(a),
            cos = Math.cos(a);
        var rx =  p.x * cos + p.z * sin;
        var rz = -p.x * sin + p.z * cos;
        return { x: rx, y: p.y, z: rz };
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

    var canvas = document.querySelector('canvas');
    var ctx = canvas.getContext('2d');

    function mainloop() {
        update(ctx);
        window.requestAnimationFrame(mainloop);
    }

    window.onload = function() {
        init(ctx);
        mainloop();
    };

})(window);
