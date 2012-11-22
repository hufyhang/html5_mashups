const _LOCAL_STORAGE = 'html5_mashup_kineticjs_stage';
const TOUCH_OFFSET = 5;
var _big_canvas_stage, _big_canvas_layer;
var _feeds_nodes = [];

var _big_counter = 0;
var _big_buffer = '';

var fixedWidth, fixedHeight;
var touchedObj = undefined;

var serviceBuffer = []; // for iterating feeds
var serviceIndex = 0;

function initialiseBigCanvas() {
    var canvas = document.getElementById('big_canvas_canvas');
    fixedWidth = canvas.offsetWidth;
    fixedHeight = canvas.offsetHeight;
    createBigCanvas(fixedWidth, fixedHeight);
    registerTouchEvents(_big_canvas_stage);
}

function registerTouchEvents(stage) {
    stage.on('touchstart', function(evt) {
        var x = stage.getTouchPosition().x;
        var y = stage.getTouchPosition().y;
        // iterate _feeds_nodes to capture the touched connector
        for(var index = 0; index != _feeds_nodes.length; ++index) {
            var connector = _feeds_nodes[index].getConnector();
            if((x - TOUCH_OFFSET <= connector.getX() && connector.getX() <= x + TOUCH_OFFSET) && 
                (y - TOUCH_OFFSET <= connector.getY() && connector.getY() <= y + TOUCH_OFFSET)) {
                touchedObj = connector;
                org_x = touchedObj.getX();
                org_y = touchedObj.getY();
                return;
            }
        }
        // iterate _feeds_nodes to capture the touched removeDot
        for(var index = 0; index != _feeds_nodes.length; ++index) {
            var removeDot = _feeds_nodes[index].getRemoveDot();
            var parentFeed = removeDot.getParentFeed();
            if((x - TOUCH_OFFSET <= removeDot.getX() && removeDot.getX() + removeDot.getWidth() <= x + TOUCH_OFFSET) && 
                (y - TOUCH_OFFSET <= removeDot.getY() && removeDot.getY() + removeDot.getHeight() <= y + TOUCH_OFFSET)) {
                removeFeedFromCanvas(parentFeed);
                return;
            }
        }
    });

    stage.on('touchmove', function(evt) {
        if(touchedObj == undefined) { // if no connectors selected, do nothing
            return;
        }
        var x = stage.getTouchPosition().x;
        var y = stage.getTouchPosition().y;
        touchedObj.getConnectingLine().show();
        touchedObj.getConnectingLine().setPoints([org_x, org_y, x, y]);
    });

    stage.on('touchend', function(evt) {
        var parentFeed;
        var tObj = touchedObj;
        if(touchedObj == undefined) {
            return;
        }
        else {
            parentFeed = touchedObj.getParentFeed();
            touchedObj = undefined;
        }

        // reset next feed and beConnectedLine
        if(parentFeed.getNextFeed() != 'undefined' && parentFeed.getNextFeed() != undefined) {
            parentFeed.getNextFeed().setBeConnectedLine('undefined');
        }
        parentFeed.setNextFeed('undefined');

        var mouseX = stage.getTouchPosition().x;
        var mouseY = stage.getTouchPosition().y;
        var result = false;
        for(var index = 0; index != _feeds_nodes.length; ++index) {
            var nodeObj = _feeds_nodes[index];
            if(ifContains(mouseX, mouseY, nodeObj.getNode())) {
                if(nodeObj.getService().getType() == TYPE_SYS_START) {
                    showMessageDialog('Oops! The "Start" node should not be connected by any other.');
                    break;
                }
                var cline = nodeObj.getBeConnectedLine();
                if(cline != 'undefined') {
                    nodeObj.getBeConnectedLine().hide();
                }
                _feeds_nodes[index].setBeConnectedLine('undefined');

                tObj.getConnectingLine().setPoints([org_x, org_y, 
                                    nodeObj.getNode().getX() + nodeObj.getNode().getBoxWidth()/2, 
                                    nodeObj.getNode().getY() + nodeObj.getNode().getBoxHeight()/2]);
                _feeds_nodes[index].setBeConnectedLine(tObj.getConnectingLine());

                parentFeed.setNextFeed(nodeObj);

                result = true;
                break;
            }
        }
        if(result == false) {
            tObj.getConnectingLine().hide();
            parentFeed.clearNextFeed();
        }
        tObj.setPosition(org_x, org_y);
        tObj.moveToTop();
    });
}

function createBigCanvas(_width, _height) {
    _big_canvas_stage = new Kinetic.Stage({
        container: "big_canvas_canvas",
        width: _width,
        height: _height,
    });

    _big_canvas_layer = new Kinetic.Layer();
    _big_canvas_stage.add(_big_canvas_layer);
    drawStartNode();
}

function renewCheck() {
    if(_feeds_nodes.length > 1) {
        visibleElement('dashboard');
        visibleElement('dashboard_div');
        $('#dashboard_output').html('<table style="width: 100%;"><tr><td><div>Are you sure you want to renew the workbench? All unsaved works will be lost.</div></td></tr><tr><td><div class="div_push_button" onclick="newProject();invisibleElement(\'dashboard_div\');invisibleElement(\'dashboard\')">Yes</div><div class="div_push_button" onclick="invisibleElement(\'dashboard_div\');invisibleElement(\'dashboard\')">No</div></td></tr></table>');
    } else {
        newProject();
    }
}

function newProject() {
    _big_counter = 0;
    _big_buffer = '';
    for(var index = 0; index != _feeds_nodes.length; ++index) {
        _feeds_nodes[index].getNode().hide();
        if(_feeds_nodes[index].getService().getType() != TYPE_WIDGET) { // widgets have no connectors
            _feeds_nodes[index].getConnector().getConnector().hide();
        }
        if(index != 0) {
            var line = _feeds_nodes[index].getBeConnectedLine();
            if(line != undefined && line != 'undefined') {
                line.hide();
            }
            _feeds_nodes[index].getRemoveDot().getRemoveDot().hide();
        }
    }
    _feeds_nodes = [];
    drawStartNode();
    $('#properties_panel_output').html('<center><img src="img/crest.png" alt="University of Manchester Crest" style="margin-top: 5%;" width="40%" height="80%"/></center>');
    appendLog('Clear workbench.');
}

function getFeedsJSON() {
    var buffer = '{\"feeds\":[ ';
    var next = _feeds_nodes[0].getNextFeed();
    while(next != undefined && next != 'undefined') {
        buffer += '{\"feed\":[{\"next\":\"' + next.getId() + '\", ';
        buffer += next.getService().getJSON();
        buffer += '}]}';

        next = next.getNextFeed();
        if(next != undefined && next != 'undefined' ) {
            buffer += ', ';
        }
    }

    buffer += ']}';
    appendLog('Generate Feeds JSON: ' + buffer + '');
    return buffer;
}

function loadFromJSON(jsonInput) {
    appendLog('Load from JSON: ' + jsonInput);
    // clear canvas

    var json = eval('(' + jsonInput + ')');
    var key, count = 0;
    for(key in json.feeds) {
        //get size of the JSON
        count++;
    }

    // if there is nothing existing, do nothing.
    if(count == 0) {
        return;
    }

    // read all data into an array and draw all the nodes
    var list = new Array();
    for(var index = 0; index != count; ++ index) {
        var item = json.feeds[index].feed[0];
        var next, id, name, type, restUrl, restMethod;
        next = parseInt(item.next);
        if(next != -1) {
            id = parseInt(item.id);
            name = item.name;
            type = item.type;
            if(type == TYPE_REST) {
                restUrl = item.restUrl;
                restMethod = item.restMethod;
                drawARestFeed(name, restUrl);
            }
            else if(type == TYPE_WIDGET) {
                drawAWidget(name);
            }
        }
        else {
            continue;
        }
        list[index] = new Array(next, id, name, type, restUrl, restMethod);
    }

    // create connecting lines and set configurations
    for(var index = 0; index != list.length; ++index) {
        _feeds_nodes[index].getConnector().connectTo(_feeds_nodes[index + 1]);
        var type = list[index][3];
        if(type == TYPE_REST) {
            var method = list[index][5];
            _feeds_nodes[index + 1].getService().setRestMethod(method);
        }
    }
}

function startIterate(dataset) {
    appendLog('Start generating workflow with dataset "' + dataset + '".');

    // reset function counter
    _big_counter = 0;
    // initiate _big_buffer
    _big_buffer = '\n<script>\nfunction executeMashup() {\n' +
                'var __result_buffer__ = \'' + dataset + '\';\n';

    startToIterateFeeds(_feeds_nodes[0]);

    // finalise _big_buffer
    _big_buffer += '\n}\n</script>\n';

    $("#temp_script_output").html(_big_buffer);

    // execute the mashup
    executeMashup();
}

function startToIterateFeeds(feed) {
    // reset serviceBuffer & serviceIndex
    serviceBuffer = [];
    serviceIndex = 0;
    iterateFeeds(feed);
    generateCode();
}

function iterateFeeds(feed){
    var service = feed.getService();
    serviceBuffer[serviceIndex] = service;
    serviceIndex++;
    var next = feed.getNextFeed();
    if(next !== 'undefined') {
        iterateFeeds(next);
    }
}

function generateCode() {
    _big_buffer += 'var counter = 1;\n\n'; // skip the start node
    _big_buffer += 'var currentServce;\n\n';
    _big_buffer += 'appendLog(\'Initialising Web Worker "serviceWorker"...\');' + '\n\n';
    _big_buffer += 'var serviceWorker = new Worker("js/serviceWorker.js");\n\n';
    _big_buffer += 'appendLog(\'Web Worker "serviceWorker" initialised.\');' + '\n\n';
    _big_buffer += 'appendLog(\'Initialising Web Worker "checkRestWorker"...\');' + '\n\n';
    _big_buffer += 'var checkWorker = new Worker("js/checkRestWorker.js");\n\n';
    _big_buffer += 'appendLog(\'Web Worker "checkRestWorker" initialised.\');' + '\n\n';
    _big_buffer += 'currentServce = serviceBuffer[counter];\n\n';
    // handle the very first feed
    _big_buffer += 'if(currentServce.getType() == TYPE_REST) {\n\n';
    _big_buffer += 'checkWorker.postMessage(serviceBuffer[counter].getRestUrl());\n\n';
    _big_buffer += '}\n\n';

    // checkWorker onmessage event
    _big_buffer += 'checkWorker.onmessage = function(e) {\n\n';
    _big_buffer += 'var bf = __result_buffer__.replace(\'"\', \'\\"\');\n\n';
    _big_buffer += 'var code = e.data;\n\n';
    _big_buffer += 'if(code != \'200\') {\n\n';
    _big_buffer += 'showMessageDialog(\'Oops! Service \"\' + currentServce.getName() + \'\" is down. Please try later or use an alternative service feed.\');'+ '\n\n'; 
    _big_buffer += 'appendLog(\'"\' + currentServce.getName() + \'" is down. #\' + code);' + '\n\n';
    _big_buffer += 'serviceWorker.terminate();\n\ncheckWorker.terminate();\n\n';
    _big_buffer += 'return;\n\n';
    _big_buffer += '}\n\n';
    _big_buffer += 'if(currentServce.getType() == TYPE_REST){\n\n';
    _big_buffer += 'appendLog(\'Received code: \' + code + \' from \' + currentServce.getRestUrl());' + '\n\n';

    // if this is the last feed and is a REST service
    _big_buffer += 'if(counter == serviceBuffer.length - 1) {\n\n';
    _big_buffer += 'currentServce = serviceBuffer[counter];\n\n';
    _big_buffer += 'if(currentServce.getType() == TYPE_REST) {\n\n';
    _big_buffer += 'var url = currentServce.getRestUrl() +  __result_buffer__;\n\n';
    _big_buffer += '$(\"#execute_output\").html(\'<iframe frameborder="0" width="100%" height="400px" src=\"\' + url + \'\" seamless=\"seamless\"><p>Surprisingly, your browser does not support iframes.</p></iframe>\');' + '\n\n';
    _big_buffer += '}\n\n';
    _big_buffer += 'appendLog(\'Showing result in execute_output\');\n\n';
    _big_buffer += 'serviceWorker.terminate();\n\ncheckWorker.terminate();\n\nreturn;\n\n';
    _big_buffer += '}\n\n';
    // <END> if this is the last feed and is a REST service </END>
    
    _big_buffer += 'counter++;\n\n';
    _big_buffer += 'var json = \'{"type":"\' + currentServce.getType() + \'", "url":"\' + currentServce.getRestUrl() + \'", "method":"\' + currentServce.getRestMethod() + \'", "buffer":"\' + bf + \'"}\';\n\n';
    _big_buffer += 'serviceWorker.postMessage(json);\n\n';
    _big_buffer += '}\n\n';
    _big_buffer += '}\n\n';

    // serviceWorker onmessage event
    _big_buffer += 'serviceWorker.onmessage = function(e) {\n\n';
    _big_buffer += '__result_buffer__ = e.data;\n\n';
    _big_buffer += 'appendLog(\'Received data: \' + __result_buffer__ );' + '\n\n';
    _big_buffer += 'currentServce = serviceBuffer[counter];\n\n';
    _big_buffer += 'if(currentServce.getType() == TYPE_REST) {\n\n';
    _big_buffer += 'checkWorker.postMessage(currentServce.getRestUrl());\n\n';
    _big_buffer += '}\n\n';

    // else if it is TYPE_WIDGET
    _big_buffer += 'else if(currentServce.getType() == TYPE_WIDGET) {\n\n';
    _big_buffer += 'if(currentServce.getName() == WIDGET_AUDIO) {\n\n';
    _big_buffer += '$(\"#execute_output\").html(\'<audio width="100%" controls=\"controls\" autoplay><source src=\"\' + __result_buffer__ + \'\">Surprisingly, your browser does not support the audio element.</audio>\');' + '\n\n';
    _big_buffer += '}\n\n';
    _big_buffer += 'else if (currentServce.getName() == WIDGET_VIDEO) {\n\n';
    _big_buffer += '$(\"#execute_output\").html(\'<video width="100%" height="400px" controls=\"controls\" autoplay><source src=\"\' + __result_buffer__ + \'\">Surprisingly, your browser does not support the video tag.</video>\');' + '\n\n' ;
    _big_buffer += '}\n\n';
    _big_buffer += 'appendLog(\'Showing result in execute_output\');\n\n';
    _big_buffer += 'serviceWorker.terminate();\n\ncheckWorker.terminate();\n\nreturn;\n\n';
    _big_buffer += '}\n\n';
    // <END>else if it is TYPE_WIDGET</END>
    
    _big_buffer += '}\n\n';
}

function moveRemoveDot(removeDot, parent_node) {
    removeDot.setPosition(parent_node.getX(), parent_node.getY());
    _big_canvas_stage.draw();
}

function moveConnector(connector, parent_node) {
    connector.setPosition(parent_node.getX() + parent_node.getWidth() - parent_node.getWidth()/2, 
                            parent_node.getY() + parent_node.getBoxHeight());
    _big_canvas_stage.draw();
}

function RemoveDot(parent_feed) {
    var parent_node = parent_feed.getNode();
    var org_x, org_y;
    var node_x = parent_node.getX() - 5;
    var node_y = parent_node.getY() - 5; 
    var parentFeed = parent_feed;

    var getParentFeed = function() {
        return parentFeed;
    };

    var getWidth = function() {
        return removeDot.getWidth();
    };

    var getHeight = function() {
        return removeDot.getHeight();
    };

    var removeDot = new Kinetic.Text({
        x: node_x,
        y: node_y,
        radius: 8,
        width: 55,
        height: 17,
        padding: 2,
        fill: '#883737',
        stroke: 'black',
        strokeWidth: 1,
        text: 'REMOVE',
        fontSize: 10,
        align: 'center',
        valign: 'center',
        textFill: 'white',
        draggable: false
    });
    removeDot.on('mouseover', function() {
        removeDot.setFontStyle('italic');
        removeDot.setFill('red');
        _big_canvas_layer.draw();
    });
    removeDot.on('mouseout', function() {
        removeDot.setFontStyle('normal');
        removeDot.setFill('#883737');
        _big_canvas_layer.draw();
    });
    removeDot.on('click', function() {
        removeFeedFromCanvas(parent_feed);
    });

    this.getRemoveDot = function() {
        return removeDot;
    };
}

function removeFeedFromCanvas(feed) {
    // alert('To be continued...');
    // return;

    feed.getNode().hide();
    var cline = feed.getBeConnectedLine();
    if(cline != 'undefined' && cline != undefined) {
        feed.getBeConnectedLine().hide();
    }
    feed.getRemoveDot().getRemoveDot().hide();
    if(feed.getService().getType() != TYPE_WIDGET) {
        feed.getConnector().getConnector().hide();
    }

    var next = feed.getNextFeed();
    if(next != 'undefined' && next != undefined) {
        next.getBeConnectedLine().hide();
        next.setBeConnectedLine('undefined');
        feed.setNextFeed('undefined');
    }

    var id = feed.getId();
    _feeds_nodes.splice(id, 1);
    // tidy up
    for(var i = 0; i != _feeds_nodes.length; ++i) {
        if(_feeds_nodes[i].getService().getType() != TYPE_SYS_START) {
            _feeds_nodes[i].setId(i);
        }
    }

    var json = '{"feeds":[';
    for(var i = 0; i != _feeds_nodes.length; ++i) {
        var url = 'undefined';
        var restMethod = 'undefined';
        var name = _feeds_nodes[i].getService().getName();
        var type = _feeds_nodes[i].getService().getType();
        if(type == TYPE_REST) {
            url = _feeds_nodes[i].getService().getRestUrl();
            restMethod = _feeds_nodes[i].getService().getRestMethod();
        }
        var next = _feeds_nodes[i].getNextFeed();
        var nextId = -1;
        if(next != 'undefined' && next != undefined) {
            nextId = next.getId();
            if(nextId == id) { // if nextId is equal to the one removed.
                nextId = -1;
            }
        }
        json += '{"name":"' + name + '", "type":"' + type + '", "url":"' + url + '", "restMethod": "' + restMethod  + '", "nextId":"' + nextId + '"}';
        if(i != _feeds_nodes.length - 1) {
            json += ', ';
        }

    }
    json += ']}';

    appendLog('Generate JSON: ' + json);
    newProject();
    appendLog('Auto-load from JSON: ' + json);

    var jsonObj = eval('(' + json + ')');
    var key, count = 0;
    for(key in jsonObj.feeds) {
        ++count;
    }

    var nextIds = [];
    for(var index = 0; index != count; ++index) {
        var item = jsonObj.feeds[index];
        var name = item.name;
        var type = item.type;
        var url = item.url;
        var restMethod = item.restMethod;
        var nid = item.nextId;
        nextIds[index] = parseInt(nid);
        switch(type) {
            case TYPE_SYS_START:
                break;
            case TYPE_REST:
                drawARestFeed(name, url);
                _feeds_nodes[_feeds_nodes.length - 1].getService().setRestMethod(restMethod);
                break;
            case TYPE_WIDGET:
                drawAWidget(name);
                break;
            default:
                    break;
        }
    }

    //make connections
    for(var index = 0; index != _feeds_nodes.length; ++index) {
        var nextId = nextIds[index];
        if(nextId != -1) {
            _feeds_nodes[index].setNextFeed(_feeds_nodes[nextId]);
            _feeds_nodes[index].getConnector().connectTo(_feeds_nodes[nextId]);
        }
    }
}

function drawFromFeedList(list) {
    var size = list.length;

    for(var index = 1; index != size; ++index) {
        var ser = list[index].getService();
        if(ser.getType() == TYPE_SYS_START) {
            drawStartNode();
        }
        else if(ser.getType() == TYPE_REST) {
            drawARestFeed(ser.getName(), ser.getRestUrl());
            _feeds_nodes[index].getService().setRestMethod(ser.getRestMethod());
        }
        else if(ser.getType() == TYPE_WIDGET) {
            drawAWidget(ser.getName());
        }
    }
}

function Connector(parent_feed) {
    var parent_node = parent_feed.getNode();
    var org_x, org_y;
    var node_x = parent_node.getX() + parent_node.getWidth() - parent_node.getWidth()/2;
    var node_y = parent_node.getY() + parent_node.getBoxHeight(); 
    var connectingLine;
    var parentFeed = parent_feed;

    this.getConnectingLine = function() {
        return connectingLine;
    };

    this.getParentNode = function() {
        return parent_node;
    };

    this.getParentFeed = function() {
        return parentFeed;
    };

    this.getX = function() {
        return connector.getX();
    };

    this.getY = function() {
        return connector.getY();
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
        // reset next feed and beConnectedLine
        if(parentFeed.getNextFeed() != 'undefined' && parentFeed.getNextFeed() != undefined) {
            parentFeed.getNextFeed().setBeConnectedLine('undefined');
        }
        parentFeed.setNextFeed('undefined');

        var mouseX = _big_canvas_stage.getMousePosition().x;
        var mouseY = _big_canvas_stage.getMousePosition().y;
        var result = false;
        for(var index = 0; index != _feeds_nodes.length; ++index) {
            var nodeObj = _feeds_nodes[index];
            if(ifContains(mouseX, mouseY, nodeObj.getNode())) {
                if(nodeObj.getService().getType() == TYPE_SYS_START) {
                    showMessageDialog('Oops! The "Start" node should not be connected by any other.');
                    break;
                }
                var cline = nodeObj.getBeConnectedLine();
                if(cline != 'undefined') {
                    nodeObj.getBeConnectedLine().hide();
                }
                _feeds_nodes[index].setBeConnectedLine('undefined');

                connectingLine.setPoints([org_x, org_y, 
                                    nodeObj.getNode().getX() + nodeObj.getNode().getBoxWidth()/2, 
                                    nodeObj.getNode().getY() + nodeObj.getNode().getBoxHeight()/2]);
                _feeds_nodes[index].setBeConnectedLine(connectingLine);

                parentFeed.setNextFeed(nodeObj);

                result = true;
                break;
            }
        }
        if(result == false) {
            connectingLine.hide();
            parentFeed.clearNextFeed();
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
    };

    this.connectTo = function(nextFeed) {
        connectingLine.setPoints([connector.getX(), connector.getY(),
                nextFeed.getNode().getX() + nextFeed.getNode().getBoxWidth()/2,
                nextFeed.getNode().getY() + nextFeed.getNode().getBoxHeight()/2]);
        nextFeed.setBeConnectedLine(connectingLine);
        parentFeed.setNextFeed(nextFeed);
        _big_canvas_layer.draw();
        _big_canvas_stage.draw();
    };
}

function drawStartNode() {
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

    var service = new Service(NAME_SYS_START, TYPE_SYS_START); 

    this.getService = function() {
        return service;
    };

    this.getNode = function() {
        return start;
    };

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
    var startConnector = new Connector(this);
    var org_connecting_line_points;

    this.getConnector = function() {
        return startConnector;
    };

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

    this.getNode = function() {
        return start;
    };

    _feeds_nodes.push(this);

    // var end = new Kinetic.Text({
    //         draggable: true,
    //         x: _big_canvas_stage.getWidth() / 2,
    //         y: _big_canvas_stage.getHeight() - 60,
    //         stroke: '#555',
    //         strokeWidth: 2,
    //         fill: '#aaa',
    //         text: 'End',
    //         fontSize: 15,
    //         fontFamily: 'Calibri',
    //         textFill: 'white',
    //         width: 80,
    //         padding: 10,
    //         align: 'center',
    //         // fontStyle: 'italic',
    //         shadow: {
    //             color: 'black',
    //             blur: 1,
    //             offset: [5, 5],
    //             opacity: 0.2
    //         },
    //         cornerRadius: 15
    // });

    // // var endConnector = new Connector(end);

    // end.on('mouseover', function() {
    //     this.setStroke('red');
    //     _big_canvas_layer.draw();
    // });
    // end.on('mouseout', function() {
    //     this.setStroke('#ddd');
    //     _big_canvas_layer.draw();
    // });

    // end.on("dragstart", function() {
    //     end.moveToTop();
    //     _big_canvas_layer.draw();
    // });

    // // end.on("dragmove", function() {
    // //     moveConnector(endConnector, end);
    // // });

    _big_canvas_layer.add(start);
    // _big_canvas_layer.add(end);

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
    var feed = new RestFeed(name, url);
    _feeds_nodes.push(feed);
}

function RestFeed(name, url) {
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

    var service = new Service(name, TYPE_REST);
    service.setRestUrl(url);
    service.setRestMethod(REST_METHOD_GET);
    // appendServivesList(service);

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

    this.getRemoveDot = function() {
        return removeDot;
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

    feedConnector = new Connector(this);
    removeDot = new RemoveDot(this);

    this.getConnector = function() {
        return feedConnector;
    };

    feed.on('mouseover', function() {
        this.setStroke('red');
        _big_canvas_layer.draw();
    });
    feed.on('mouseout', function() {
        this.setStroke('black');
        _big_canvas_layer.draw();
    });

    feed.on('click', function() {
        propertiesPanelShowRestFeed(service);
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


    _big_canvas_layer.add(feed);
    _big_canvas_layer.add(feedConnector.getConnector());
    _big_canvas_layer.add(removeDot.getRemoveDot());
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

