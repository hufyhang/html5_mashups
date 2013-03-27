const WORKER_FETCH_LAST_BY_KEY = 'Fetch Data from JSON';
const WORKER_ADD_TEXT = 'Add Text';
const WORKER_GEO_JSON = 'Geolocation (JSON)';
const WORKER_GEO_TEXT = 'Geolocation (Text)';
const WORKER_OUTPUT = 'Push into Output';
const WORKER_TRIM_WHITESPACE = 'Trim & Replace Whitespace';
const WORKER_REMOVE_SPECIAL = 'Remove Special Characters';

function drawAWorker(type) {
    var feed = new SysWorker(type);
    _feeds_nodes.push(feed);
    _big_canvas_layer.add(feed.getBox());
    _big_canvas_layer.add(feed.getNode());
    _big_canvas_layer.add(feed.getConnector().getConnector());
    _big_canvas_layer.add(feed.getRemoveDot().getBox());
    _big_canvas_layer.add(feed.getRemoveDot().getRemoveDot());
    _big_canvas_stage.draw();
}

function WorkerTrimWhitespace() {
    var replaceWith = '';
    this.getReplaceWith = function() {
        return replaceWith;
    };
    this.setReplaceWith = function(input) {
        replaceWith = input;
    };
}

function WorkerAddText() {
    var beforeText = '';
    var afterText = '';
    this.getBeforeText = function() {
        return beforeText;
    };
    this.getAfterText = function() {
        return afterText;
    };
    this.setBeforeText = function(input) {
        beforeText = input;
    };
    this.setAfterText = function(input) { 
        afterText = input;
    };
}

function SysWorker(type) {
    var org_connecting_line_points, beConnectedLine = 'undefined';
    var id = _feeds_nodes.length;
    var feedConnector;
    var removeDot;

    var nextFeed = 'undefined';
    this.setNextFeed = function(feed) {
        nextFeed = feed;
    };
    this.getNextFeed = function() {
        return nextFeed;
    };
    this.clearNextFeed = function() {
        nextFeed = 'undefined';
    };

    var service = new Service(type, TYPE_WORKER);
    service.setFetchJSONKey(''); 
    service.setAddTextObject(new WorkerAddText());
    service.setTrimWhitespace(new WorkerTrimWhitespace());

    this.getService = function() {
        return service;
    };

    this.getBeConnectedLine = function() {
        return beConnectedLine;
    };

    this.setBeConnectedLine = function(line) {
        beConnectedLine = line;
    };

    this.getNode = function() {
        return feed;
    };

    this.setId = function(inputId) {
        id = inputId;
    };

    this.getId = function() {
        return id;
    };

    this.getConnector = function() {
        return feedConnector;
    };

    var feed = new Kinetic.Text({
            draggable: true,
            x: 0,
            y: 0,
            stroke: 'black',
            strokeWidth: 1,
            fill: '#ddf',
            text: type,
            fontSize: 12,
            fontFamily: 'Arial',
            textFill: 'black',
            width: 350,
            padding: 10,
            align: 'center'
    });

    var box = new Kinetic.Rect({
            draggable: true,
            x: feed.getX(),
            y: feed.getY(),
            stroke: 'black',
            fill: '#ddf',
            width: feed.getWidth(),
            height: feed.getHeight(),
            shadowColor: 'black',
            shadowOffset: [5, 5],
            cornerRadius: 5
    });

    this.getBox = function() {
        return box;
    };

    feedConnector = new Connector(this);
    removeDot = new RemoveDot(this);

    this.getRemoveDot = function() {
        return removeDot;
    };

    var mouse_over = function() {
        box.setStroke('red');
        feed.setStroke('red');
        _big_canvas_layer.draw();
    };
    var mouse_out = function() {
        box.setStroke('black');
        feed.setStroke('black');
        _big_canvas_layer.draw();
    };

    box.on('mouseover', function() {
        mouse_over();
    });
    box.on('mouseout', function() {
        mouse_out();
    });
    feed.on('mouseover', function() {
        mouse_over();
    });
    feed.on('mouseout', function() {
        mouse_out();
    });

    box.on('click', function() {
        propertiesPanelShowSysWorker(service);
    });
    feed.on('click', function() {
        propertiesPanelShowSysWorker(service);
    });

    var dragstart = function() {
        org_connecting_line_points = feedConnector.getConnectingLine().getPoints();
        box.moveToTop();
        feed.moveToTop();
        feedConnector.getConnector().moveToTop();
        removeDot.getBox().moveToTop();
        removeDot.getRemoveDot().moveToTop();
        _big_canvas_layer.draw();
    };

    box.on("dragstart", function() {
        dragstart();
    });
    feed.on("dragstart", function() {
        dragstart();
    });


    var dragmove = function() {
        moveConnector(feedConnector.getConnector(), feed);
        moveRemoveDot(removeDot.getRemoveDot(), feed);
        removeDot.getBox().setX(removeDot.getRemoveDot().getX());
        removeDot.getBox().setY(removeDot.getRemoveDot().getY());

        if(org_connecting_line_points.length > 1) {
            var org_point = org_connecting_line_points[1];
            feedConnector.getConnectingLine().setPoints([feedConnector.getConnector().getX(), 
                        feedConnector.getConnector().getY(), org_point.x, org_point.y]);
        }

        if(beConnectedLine !== 'undefined') {
            beConnectedLine.setPoints([beConnectedLine.getPoints()[0].x, beConnectedLine.getPoints()[0].y,
            feed.getX() + feed.getWidth()/2, feed.getY() + feed.getHeight()/2]); 
        }

        _big_canvas_layer.draw();
    };
    box.on("dragmove", function() {
        feed.setX(box.getX());
        feed.setY(box.getY());
        dragmove();
    });
    feed.on("dragmove", function() {
        box.setX(feed.getX());
        box.setY(feed.getY());
        dragmove();
    });
}


