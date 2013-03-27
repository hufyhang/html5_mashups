WIDGET_AUDIO = 'HTML5 Audio';
WIDGET_VIDEO = 'HTML5 Video';
WIDGET_IMAGE = 'HTML5 Image';

function drawAWidget(type) {
    var feed = new Widget(type);
    _feeds_nodes.push(feed);
}

function Widget(type) {
    var beConnectedLine = 'undefined';
    var id = _feeds_nodes.length;
    var removeDot;

    var nextFeed = 'undefined';
    this.getNextFeed = function() {
        return nextFeed;
    };
    this.clearNextFeed = function() {
        nextFeed = 'undefined';
    };

    var service = new Service(type, TYPE_WIDGET);

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

    var dragstart = function() {
        box.moveToTop();
        feed.moveToTop();
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
        moveRemoveDot(removeDot.getRemoveDot(), feed);
        removeDot.getBox().setX(removeDot.getRemoveDot().getX());
        removeDot.getBox().setY(removeDot.getRemoveDot().getY());

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

    _big_canvas_layer.add(box);
    _big_canvas_layer.add(feed);
    _big_canvas_layer.add(removeDot.getBox());
    _big_canvas_layer.add(removeDot.getRemoveDot());
    _big_canvas_stage.draw();
}


