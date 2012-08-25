var _LOCAL_STORAGE = 'html5_mashup_kineticjs_stage';
var _big_canvas_stage, _big_canvas_layer;
var _feeds_nodes = [];

function initialiseBigCanvas() {
    var canvas = document.getElementById('big_canvas_canvas');
    _big_canvas_stage = new Kinetic.Stage({
        container: "big_canvas_canvas",
        width: canvas.offsetWidth,
        height: canvas.offsetHeight,
    });

    _big_canvas_layer = new Kinetic.Layer();
    _big_canvas_stage.add(_big_canvas_layer);
}

function resizeBigCanvas() {
    // var canvas = document.getElementById('big_canvas_canvas');
    // var width = canvas.offsetWidth;
    // var height = canvas.offsetHeight;
    // _big_canvas_stage.setSize(width, height);
    // _big_canvas_stage.draw();
}

function updateLocalStogate() {
    if(typeof(Storage) !== 'undefined') {
        localStorage[_LOCAL_STORAGE] = _big_canvas_stage.toJSON();
    }
}

function loadLocalStorage() {
    if(typeof(Storage) !== 'undefined') {
        _big_canvas_stage.load(localStorage[_LOCAL_STORAGE]);
    }
}

function drawARestFeed(name, url) {
    var feed = new Kinetic.Text({
            draggable: true,
            x: 0,
            y: 0,
            stroke: '#555',
            strokeWidth: 2,
            fill: '#ddd',
            text: name + '\n\n' + url,
            fontSize: 10,
            fontFamily: 'Calibri',
            textFill: '#555',
            width: 350,
            padding: 10,
            align: 'center',
            // fontStyle: 'italic',
            shadow: {
                color: 'black',
                blur: 1,
                offset: [5, 5],
                opacity: 0.2
            },
            cornerRadius: 5
    });

    feed.on('mouseover', function() {
        this.setStroke('red');
        _big_canvas_layer.draw();
    });
    feed.on('mouseout', function() {
        this.setStroke('#ddd');
        _big_canvas_layer.draw();
    });

    feed.on('click', function() {
        propertiesPanelShowRestFeed(name, url, 'get');
    });

    feed.on("dragstart", function() {
        feed.moveToTop();
        _big_canvas_layer.draw();
    });

    _feeds_nodes.push(feed);

    _big_canvas_layer.add(feed);
    _big_canvas_stage.add(_big_canvas_layer);
    _big_canvas_stage.draw();
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

