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

    drawStartAndEndNodes();
}

function resizeBigCanvas() {
    // var canvas = document.getElementById('big_canvas_canvas');
    // var width = canvas.offsetWidth;
    // var height = canvas.offsetHeight;
    // _big_canvas_stage.setSize(width, height);
    // _big_canvas_stage.draw();
}

function moveConnector(connector, parent_node) {
    connector.setPosition(parent_node.getX() + parent_node.getWidth() - parent_node.getWidth()/2, 
                            parent_node.getY() + parent_node.getBoxHeight());
    _big_canvas_stage.draw();
}

function Connector(parent_node) {
    var org_x, org_y;
    var node_x = parent_node.getX() + parent_node.getWidth() - parent_node.getWidth()/2;
    var node_y = parent_node.getY() + parent_node.getBoxHeight(); 
    var connectingLine;

    this.getConnectingLine = function() {
        return connectingLine;
    };

    var connector = new Kinetic.Circle({
            x: node_x,
            y: node_y,
            radius: 8,
            fill: '#00A8E6',
            stroke: 'black',
            strokeWidth: 1,
            draggable: true
    });
    connector.on("mouseover", function() {
        this.setFill('#66A8FF');
        this.setStroke('orange');
        this.setStrokeWidth(3);
        _big_canvas_layer.draw();
    });
    connector.on("mouseout", function() {
        this.setFill('#00A8E6');
        this.setStroke('black');
        this.setStrokeWidth(1);
        _big_canvas_layer.draw();
    });
    connector.on("dragstart", function() {
        org_x = this.getX();
        org_y = this.getY();
    });
    connector.on("dragmove", function() {
        connectingLine.show();
        connectingLine.setPoints([org_x, org_y, _big_canvas_stage.getMousePosition().x, _big_canvas_stage.getMousePosition().y]);
        this.moveToTop();
    });
    connector.on("dragend", function() {
        var mouseX = _big_canvas_stage.getMousePosition().x;
        var mouseY = _big_canvas_stage.getMousePosition().y;
        var result = false;
        for(var index = 0; index != _feeds_nodes.length; ++index) {
            var node = _feeds_nodes[index];
            if(ifContains(mouseX, mouseY, node)) {
                connectingLine.setPoints([org_x, org_y, node.getX() + node.getBoxWidth()/2, node.getY() + node.getBoxHeight()/2]);
                result = true;
                break;
            }
        }
        if(result == false) {
            connectingLine.hide();
        }
        this.setPosition(org_x, org_y);
        this.moveToTop();
    });

    // construct connecting line
    connectingLine = new Kinetic.Line({
        points: [node_x, node_y],
        stroke: '#00A8E6',
        strokeWidth: 6,
        lineCap: 'round',
        lineJoin: 'round'
    });
    connectingLine.on("mouseover", function() {
        this.setStroke('red');
        _big_canvas_layer.draw();
    });
    connectingLine.on("mouseout", function() {
        this.setStroke('#00A8E6');
        _big_canvas_layer.draw();
    });

    _big_canvas_layer.add(connectingLine);

    this.getConnector = function() {
        return connector;
    }
}

// function getConnectingLine(connector) {
//     return connector.connectingLine;
// }

function drawStartAndEndNodes() {
    var start = new Kinetic.Text({
            draggable: true,
            x:  _big_canvas_stage.getWidth() / 2,
            y: 10,
            stroke: '#555',
            strokeWidth: 2,
            fill: '#aaa',
            text: 'Start',
            fontSize: 15,
            fontFamily: 'Calibri',
            textFill: 'white',
            width: 80,
            padding: 10,
            align: 'center',
            // fontStyle: 'italic',
            shadow: {
                color: 'black',
                blur: 1,
                offset: [5, 5],
                opacity: 0.2
            },
            cornerRadius: 15
    });
    var startConnector = new Connector(start);
    var org_connecting_line_points;

    start.on('mouseover', function() {
        this.setStroke('red');
        _big_canvas_layer.draw();
    });
    start.on('mouseout', function() {
        this.setStroke('#ddd');
        _big_canvas_layer.draw();
    });

    start.on("dragstart", function() {
        org_connecting_line_points = startConnector.getConnectingLine().getPoints();
        start.moveToTop();
        startConnector.getConnector().moveToTop();
        _big_canvas_layer.draw();
    });

    start.on("dragmove", function(){
        moveConnector(startConnector.getConnector(), start);
        if(org_connecting_line_points.length > 1) {
            var org_point = org_connecting_line_points[1];
            startConnector.getConnectingLine().setPoints([startConnector.getConnector().getX(), 
                        startConnector.getConnector().getY(), org_point.x, org_point.y]);
        }
        _big_canvas_layer.draw();
    });

    var end = new Kinetic.Text({
            draggable: true,
            x: _big_canvas_stage.getWidth() / 2,
            y: _big_canvas_stage.getHeight() - 60,
            stroke: '#555',
            strokeWidth: 2,
            fill: '#aaa',
            text: 'End',
            fontSize: 15,
            fontFamily: 'Calibri',
            textFill: 'white',
            width: 80,
            padding: 10,
            align: 'center',
            // fontStyle: 'italic',
            shadow: {
                color: 'black',
                blur: 1,
                offset: [5, 5],
                opacity: 0.2
            },
            cornerRadius: 15
    });

    // var endConnector = new Connector(end);

    end.on('mouseover', function() {
        this.setStroke('red');
        _big_canvas_layer.draw();
    });
    end.on('mouseout', function() {
        this.setStroke('#ddd');
        _big_canvas_layer.draw();
    });

    end.on("dragstart", function() {
        end.moveToTop();
        _big_canvas_layer.draw();
    });

    // end.on("dragmove", function() {
    //     moveConnector(endConnector, end);
    // });


    _big_canvas_layer.add(start);
    _big_canvas_layer.add(end);

    _big_canvas_layer.add(startConnector.getConnector());
    // _big_canvas_layer.add(endConnector);

    _big_canvas_stage.draw();
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
    var org_connecting_line_points;
    var feedConnector;
    var feed = new Kinetic.Text({
            draggable: true,
            x: 0,
            y: 0,
            stroke: 'black',
            strokeWidth: 1,
            fill: '#ddf',
            text: name + '\n\n' + url,
            fontSize: 10,
            fontFamily: 'Calibri',
            textFill: 'black',
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

    feedConnector = new Connector(feed);

    feed.on('mouseover', function() {
        this.setStroke('red');
        _big_canvas_layer.draw();
    });
    feed.on('mouseout', function() {
        this.setStroke('black');
        _big_canvas_layer.draw();
    });

    feed.on('click', function() {
        propertiesPanelShowRestFeed(name, url, 'get');
    });

    feed.on("dragstart", function() {
        org_connecting_line_points = feedConnector.getConnectingLine().getPoints();
        feed.moveToTop();
        feedConnector.getConnector().moveToTop();
        _big_canvas_layer.draw();
    });

    feed.on("dragmove", function() {
        moveConnector(feedConnector.getConnector(), feed);

        if(org_connecting_line_points.length > 1) {
            var org_point = org_connecting_line_points[1];
            feedConnector.getConnectingLine().setPoints([feedConnector.getConnector().getX(), 
                        feedConnector.getConnector().getY(), org_point.x, org_point.y]);
        }

        _big_canvas_layer.draw();
    });

    _feeds_nodes.push(feed);

    _big_canvas_layer.add(feed);
    _big_canvas_layer.add(feedConnector.getConnector());
    _big_canvas_stage.draw();
} 

function ifContains(pointX, pointY, node) {
    var x1 = node.getX();
    var x2 = node.getX() + node.getWidth();
    var y1 = node.getY();
    var y2 = node.getY() + node.getBoxHeight();
    var result;
    if((x1 < pointX) && (x2 > pointX) && (y1 < pointY) && (y2 > pointY)) {
        result = true;
    } else {
        result = false;
    }
    return result;
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

