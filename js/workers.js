const WORKER_FETCH_LAST_BY_KEY = 'Last Value';
const WORKER_ADD_TEXT = 'Add Text';
const WORKER_GEO_JSON = 'Geolocation (JSON)';
const WORKER_GEO_TEXT = 'Geolocation (Text)';

function drawAWorker(type) {
    var feed = new SysWorker(type);
    _feeds_nodes.push(feed);
    _big_canvas_layer.add(feed.getNode());
    _big_canvas_layer.add(feed.getConnector().getConnector());
    _big_canvas_layer.add(feed.getRemoveDot().getRemoveDot());
    _big_canvas_stage.draw();
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

    feedConnector = new Connector(this);
    removeDot = new RemoveDot(this);

    this.getRemoveDot = function() {
        return removeDot;
    };

    feed.on('mouseover', function() {
        this.setStroke('red');
        _big_canvas_layer.draw();
    });
    feed.on('mouseout', function() {
        this.setStroke('black');
        this.setFill('#ddf');
        _big_canvas_layer.draw();
    });

    feed.on('click', function() {
        propertiesPanelShowSysWorker(service);
    });

    feed.on("dragstart", function() {
        org_connecting_line_points = feedConnector.getConnectingLine().getPoints();
        feed.moveToTop();
        feedConnector.getConnector().moveToTop();
        removeDot.getRemoveDot().moveToTop();
        _big_canvas_layer.draw();
    });

    feed.on("dragmove", function() {
        moveConnector(feedConnector.getConnector(), feed);
        moveRemoveDot(removeDot.getRemoveDot(), feed);

        if(org_connecting_line_points.length > 1) {
            var org_point = org_connecting_line_points[1];
            feedConnector.getConnectingLine().setPoints([feedConnector.getConnector().getX(), 
                        feedConnector.getConnector().getY(), org_point.x, org_point.y]);
        }

        if(beConnectedLine !== 'undefined') {
            beConnectedLine.setPoints(beConnectedLine.getPoints()[0].x, beConnectedLine.getPoints()[0].y,
                                        this.getX() + this.getBoxWidth()/2, this.getY() + this.getBoxHeight()/2); 
        }

        _big_canvas_layer.draw();
    });
}


