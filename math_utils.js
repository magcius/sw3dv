
    function rotateX(p, angle) {
        var sin = Math.sin(angle), cos = Math.cos(angle);
        var ry = p.y * cos - p.z * sin;
        var rz = p.y * sin + p.z * cos;
        return point(p.x, ry, rz);
    }

    function rotateY(p, angle) {
        var sin = Math.sin(angle), cos = Math.cos(angle);
        var rx =  p.x * cos + p.z * sin;
        var rz = -p.x * sin + p.z * cos;
        return point(rx, p.y, rz);
    }

    var CUBE_FACES = [
        [0, 1, 3, 2],
        [0, 1, 5, 4],
        [4, 5, 7, 6],
        [2, 3, 7, 6],
        [0, 2, 6, 4],
        [1, 3, 7, 5],
    ];

    function randColor() {
        function R() { return (Math.random() * 255) | 0; }
        return 'rgba(' + R() + ', ' + R() + ', ' + R() + ', 0.4)';
    }
