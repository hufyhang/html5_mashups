var _big_canvas_stage, _big_canvas_layer;

function initialiseCanvas() {
    initialiseBigCanvas();
    drawARect();
};
 
function initialiseBigCanvas() {
    var canvas = document.getElementById('big_canvas_canvas');
    _big_canvas_stage = new Kinetic.Stage({
        container: "big_canvas_canvas",
        width: canvas.offsetWidth,
        height: canvas.offsetHeight,
    });
    _big_canvas_layer = new Kinetic.Layer();
}

function drawARect() {
    var box = new Kinetic.Rect({
        x: 0,
        y: 0,
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 2,
        width: 200,
        height: 100,
        draggable: true
    });
    _big_canvas_layer.add(box);
    _big_canvas_stage.add(_big_canvas_layer);
    _big_canvas_stage.draw();
}

