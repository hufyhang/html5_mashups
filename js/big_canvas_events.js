var _LOCAL_STORAGE = 'html5_mashup_kineticjs_stage';
var TOUCH_OFFSET = 5;
var _big_canvas_stage, _big_canvas_layer;
var _feeds_nodes = [];

var _big_counter = 0;
var _big_buffer = '';

var fixedWidth, fixedHeight;
var touchedObj = undefined;
var touchedNode = undefined;

var SysWorkerFeed = undefined; // the global variable for keeping the current SYSWORKER being connected

function initialiseBigCanvas() {
    var canvas = document.getElementById('big_canvas_canvas');
    fixedWidth = canvas.offsetWidth;
    fixedHeight = canvas.offsetHeight;
    createBigCanvas(fixedWidth, fixedHeight);
    registerTouchEvents(_big_canvas_stage);
}

function registerTouchEvents(stage) {
    stage.on('touchstart', function(evt) {
        touchedObj = undefined;
        touchedNode = undefined;
        var x = stage.getTouchPosition().x;
        var y = stage.getTouchPosition().y;
        // iterate _feeds_nodes to capture the tapped removeDot
        for(var index = 1; index != _feeds_nodes.length; ++index) {
            var removeDot = _feeds_nodes[index].getRemoveDot().getRemoveDot();
            var parentFeed = _feeds_nodes[index];
            if((x - TOUCH_OFFSET >= removeDot.getX() && removeDot.getX() + removeDot.getWidth() >= x + TOUCH_OFFSET) &&
                (y - TOUCH_OFFSET >= removeDot.getY() && removeDot.getY() + removeDot.getTextHeight() + 3 * TOUCH_OFFSET >= y)) {
                removeFeedFromCanvas(parentFeed);
                return;
            }
        }

        // iterate _feeds_nodes to capture the touched connector
        for(var index = 0; index != _feeds_nodes.length; ++index) {
            var connector = _feeds_nodes[index].getConnector();
            if((x - TOUCH_OFFSET <= connector.getX() && connector.getX() <= x + TOUCH_OFFSET) &&
                (y - TOUCH_OFFSET <= connector.getY() && connector.getY() <= y + TOUCH_OFFSET)) {
                touchedObj = connector;
                touchedNode = _feeds_nodes[index];
                org_x = touchedObj.getX();
                org_y = touchedObj.getY();
                return;
            }
        }

        // iterate _feeds_nodes to capture the touched node
        for(var index = 0; index != _feeds_nodes.length; ++index) {
            var node = _feeds_nodes[index].getNode();
            if((x - TOUCH_OFFSET >= node.getX() && node.getX() + node.getWidth() >= x + TOUCH_OFFSET) && (y - TOUCH_OFFSET >= node.getY() && node.getY() + node.getTextHeight() + 3 * TOUCH_OFFSET >= y)) {
                var type = _feeds_nodes[index].getService().getType();
                switch(type) {
                    case TYPE_REST:
                        propertiesPanelShowRestFeed(_feeds_nodes[index].getService());
                        break;
                    case TYPE_SOAP:
                        propertiesPanelShowSoapFeed(_feeds_nodes[index].getService());
                        break;
                    case TYPE_WORKER:
                        propertiesPanelShowSysWorker(_feeds_nodes[index].getService());
                        break;
                    default:
                        break;
                }
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
        _big_canvas_layer.draw();
    });

    stage.on('touchend touchcancel', function(evt) {
        var parentFeed;
        var tObj = touchedObj;

        if(touchedObj == undefined) {
            return;
        }
        else {
            parentFeed = touchedObj.getParentFeed();
        }

        // reset next feed and beConnectedLine
        if(parentFeed.getNextFeed() != 'undefined' && parentFeed.getNextFeed() != undefined) {
            parentFeed.getNextFeed().setBeConnectedLine('undefined');
        }
        parentFeed.setNextFeed('undefined');

        var mouseX = stage.getTouchPosition().x;
        var mouseY = stage.getTouchPosition().y;
        var result = false;
        var nodeObj;
        for(var index = 0; index != _feeds_nodes.length; ++index) {
            nodeObj = _feeds_nodes[index];
            if(ifContains(mouseX, mouseY, nodeObj.getNode())) {
                if(nodeObj.getService().getType() == TYPE_SYS_START) {
                    showMessageDialog('Oops! The "Start" node should not be connected by any other.');
                    break;
                }

                // check if need to pop up fetchJSONFeed dialog
                if(nodeObj.getService().getType() == TYPE_WORKER && nodeObj.getService().getName() == WORKER_FETCH_LAST_BY_KEY) {
                    if(nodeObj.getService().getFetchJSONKey().length == 0) {
                        fetchJSONFeed = nodeObj;
                        showFetchJSONDialog();
                    }
                }

                result = true;
                break;
            }
        }
        if(result === false) {
            touchedObj.getConnectingLine().hide();
            parentFeed.clearNextFeed();
        }
        else {
            touchedNode.getConnector().connectTo(nodeObj);
        }

        if (touchedObj.setPosition && touchedObj.moveToTop) {
            touchedObj.setPosition(org_x, org_y);
            touchedObj.moveToTop();
        }
    });
}

function createBigCanvas(_width, _height) {
    _big_canvas_stage = new Kinetic.Stage({
        container: "big_canvas_canvas",
        width: _width,
        height: _height
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
        _feeds_nodes[index].getBox().hide();
        if(_feeds_nodes[index].getService().getType() != TYPE_WIDGET) { // widgets have no connectors
            _feeds_nodes[index].getConnector().getConnector().hide();
        }
        if(index != 0) {
            var line = _feeds_nodes[index].getBeConnectedLine();
            if(line != undefined && line != 'undefined') {
                line.hide();
            }
            _feeds_nodes[index].getRemoveDot().getRemoveDot().hide();
            _feeds_nodes[index].getRemoveDot().getBox().hide();
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
    var offset = undefined;
    if(_feeds_nodes.length == 1) {
        offset = 0;
    }

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
        var next, id, name, type, restUrl, restMethod, keywords, wsdl, soapFuncId;
        next = parseInt(item.next);
        if(next != -1) {
            id = parseInt(item.id);
            name = item.name;
            type = item.type;
            keywords = item.keywords;
            if(type == TYPE_REST) {
                restUrl = item.restUrl;
                restMethod = item.restMethod;
                drawAServiceFeed(name, TYPE_REST, restUrl, keywords);
            }
            else if(type == TYPE_SOAP) {
                wsdl = item.wsdl;
                soapFuncId = item.soapFuncId;
                drawAServiceFeed(name, TYPE_SOAP, wsdl, keywords);
            }
            else if(type == TYPE_WIDGET) {
                drawAWidget(name);
            }
            else if(type == TYPE_WORKER) {
                drawAWorker(name);
                _feeds_nodes[_feeds_nodes.length - 1].getService().setFetchJSONKey(item.fetchJSONkey);
                _feeds_nodes[_feeds_nodes.length - 1].getService().getAddTextObject().setBeforeText(item.addBefore);
                _feeds_nodes[_feeds_nodes.length - 1].getService().getAddTextObject().setAfterText(item.addAfter);
                var trimWhite = valueOrDefault(item.trimWhiteSpace);
                _feeds_nodes[_feeds_nodes.length - 1].getService().getTrimWhitespace().setReplaceWith(trimWhite);
            }
        }
        else {
            continue;
        }
        list[index] = new Array(next, id, name, type, restUrl, restMethod, wsdl, soapFuncId);
    }

    if(offset === undefined) {
        offset = _feeds_nodes.length - list.length;
    }
    // create connecting lines and set configurations
    var index;
    for(index = 0; index != list.length; ++index) {
        _feeds_nodes[index + offset].getConnector().connectTo(_feeds_nodes[index + 1 + offset]);
        var type = list[index][3];
        if(type == TYPE_REST) {
            var method = list[index][5];
            _feeds_nodes[index + 1 + offset].getService().setRestMethod(method);
        }
        else if(type == TYPE_SOAP) {
            var funcId = list[index][7];
            _feeds_nodes[index + 1 + offset].getService().setSoapFunctionId(funcId);
        }
    }
}

function startIterate(dataset) {
    startComposition(_feeds_nodes, dataset);
}

function replaceRestFeed(targetIndex, inputName, inputUrl, inputKeywords) {
    var feed;
    var counter = 0;
    feed = _feeds_nodes[0];
    while(counter != targetIndex) {
        feed = feed.getNextFeed();
        ++counter;
    }
    feed.getService().setType(TYPE_REST);
    feed.getService().setName(inputName);
    feed.getService().setRestUrl(inputUrl);
    feed.getService().setKeywords(inputKeywords);
    var targetNode = feed.getNode();
    feed = new RestFeed(inputName, inputUrl, inputKeywords);

    feed.setNextFeed(_feeds_nodes[feed.getId() - 2].getNextFeed());

    redrawFeed(targetNode, feed);
    appendLog('Replaced unavailable service No.' + targetIndex + ' with {NAME:"' + inputName + '", URL:"' + inputUrl + '", KEYWORDS:"' +inputKeywords + '"}');
}

function replaceSOAPFeed(targetIndex, inputName, inputUrl, inputKeywords) {
    var feed;
    var counter = 0;
    feed = _feeds_nodes[0];
    while(counter != targetIndex) {
        feed = feed.getNextFeed();
        ++counter;
    }
    feed.getService().setType(TYPE_SOAP);
    feed.getService().setName(inputName);
    feed.getService().setWSDL(inputUrl);
    feed.getService().setKeywords(inputKeywords);
    var targetNode = feed.getNode();
    feed = new RestFeed(inputName, inputUrl, inputKeywords);

    feed.setNextFeed(_feeds_nodes[feed.getId() - 2].getNextFeed());

    redrawFeed(targetNode, feed);
    appendLog('Replaced unavailable service No.' + targetIndex + ' with {NAME:"' + inputName + '", URL:"' + inputUrl + '", KEYWORDS:"' +inputKeywords + '"}');
}

function moveRemoveDot(removeDot, parent_node) {
    removeDot.setPosition(parent_node.getX(), parent_node.getY());
    _big_canvas_stage.draw();
}

function moveConnector(connector, parent_node) {
    connector.setPosition(parent_node.getX() + parent_node.getWidth() - parent_node.getWidth()/2,
                            // parent_node.getY() + parent_node.getBoxHeight());
                            parent_node.getY() + parent_node.getHeight());
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
        return removeDot.getTextHeight();
    };

    var removeDot = new Kinetic.Text({
        x: node_x,
        y: node_y,
        width: 55,
        height: 17,
        padding: 2,
        fill: '#883737',
        stroke: 'white',
        strokeWidth: 1,
        text: 'REMOVE',
        fontSize: 10,
        align: 'center',
        valign: 'center',
        textFill: 'white',
        draggable: false
    });
    var box = new Kinetic.Rect({
            x: removeDot.getX(),
            y: removeDot.getY(),
            width: removeDot.getWidth(),
            height: removeDot.getHeight(),
            stroke: 'black',
            fill: '#883737',
            strokeWidth: 1,
            cornerRadius: 2
    });

    var mouse_over = function() {
        removeDot.setFontStyle('italic');
        box.setFill('red');
        _big_canvas_layer.draw();
    };
    var mouse_out = function() {
        removeDot.setFontStyle('normal');
        box.setFill('#883737');
        _big_canvas_layer.draw();
    };

    box.on('mouseover', function() {
        mouse_over();
    });
    box.on('mouseout', function() {
        mouse_out();
    });
    removeDot.on('mouseover', function() {
        mouse_over();
    });
    removeDot.on('mouseout', function() {
        mouse_out();
    });

    box.on('click', function() {
        removeFeedFromCanvas(parent_feed);
    });
    removeDot.on('click', function() {
        removeFeedFromCanvas(parent_feed);
    });

    this.getRemoveDot = function() {
        return removeDot;
    };

    this.getBox = function() {
        return box;
    };
}

function removeFeedFromCanvas(feed) {
    // alert('To be continued...');
    // return;

    feed.getNode().hide();
    feed.getBox().hide();
    var cline = feed.getBeConnectedLine();
    if(cline != 'undefined' && cline != undefined) {
        feed.getBeConnectedLine().hide();
    }
    feed.getRemoveDot().getRemoveDot().hide();
    feed.getRemoveDot().getBox().hide();
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
        var wsdl = '';
        var soapFuncId = 0;
        var restMethod = 'undefined';
        var name = _feeds_nodes[i].getService().getName();
        var type = _feeds_nodes[i].getService().getType();
        var keywords = _feeds_nodes[i].getService().getKeywords();
        var fetchJSONkey = _feeds_nodes[i].getService().getFetchJSONKey();
        var addBefore = '';
        var addAfter = '';
        if(type == TYPE_REST) {
            url = _feeds_nodes[i].getService().getRestUrl();
            restMethod = _feeds_nodes[i].getService().getRestMethod();
        }
        else if(type == TYPE_SOAP) {
            wsdl = _feeds_nodes[i].getService().getWSDL();
            soapFuncId = _feeds_nodes[i].getService().getSoapFunctionId();
        }
        else if(type == TYPE_WORKER) {
            addBefore = _feeds_nodes[i].getService().getAddTextObject().getBeforeText();
            addAfter = _feeds_nodes[i].getService().getAddTextObject().getAfterText();
        }
        var next = _feeds_nodes[i].getNextFeed();
        var nextId = -1;
        if(next != 'undefined' && next != undefined) {
            nextId = next.getId();
            if(nextId == id) { // if nextId is equal to the one removed.
                nextId = -1;
            }
        }
        json += '{"name":"' + name + '", "type":"' + type + '", "wsdl":"' + wsdl + '", "soapFuncId":"' + soapFuncId + '", "url":"' + url + '", "restMethod": "' + restMethod + '", "fetchJSONkey":"' + fetchJSONkey + '", "addBefore":"' + addBefore + '", "addAfter":"' + addAfter + '", "keywords": "' + keywords + '", "nextId":"' + nextId + '"}';
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
        var wsdl = item.wsdl;
        var soapFuncId = item.soapFuncId;
        var url = item.url;
        var restMethod = item.restMethod;
        var keywords = item.keywords;
        var fetchJSONkey = item.fetchJSONkey;
        var nid = item.nextId;
        nextIds[index] = parseInt(nid);
        switch(type) {
            case TYPE_SYS_START:
                break;
            case TYPE_REST:
                drawAServiceFeed(name, TYPE_REST, url, keywords);
                _feeds_nodes[_feeds_nodes.length - 1].getService().setRestMethod(restMethod);
                break;
            case TYPE_SOAP:
                drawAServiceFeed(name, TYPE_SOAP, wsdl, keywords);
                _feeds_nodes[_feeds_nodes.length - 1].getService().setSoapFunctionId(soapFuncId);
                break;
            case TYPE_WIDGET:
                drawAWidget(name);
                break;
            case TYPE_WORKER:
                drawAWorker(name);
                _feeds_nodes[_feeds_nodes.length - 1].getService().setFetchJSONKey(fetchJSONkey);
                _feeds_nodes[_feeds_nodes.length - 1].getService().getAddTextObject().setBeforeText(item.addBefore);
                _feeds_nodes[_feeds_nodes.length - 1].getService().getAddTextObject().setAfterText(item.addAfter);
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
            drawAServiceFeed(ser.getName(), TYPE_REST, ser.getRestUrl(), ser.getKeywords());
            _feeds_nodes[index].getService().setRestMethod(ser.getRestMethod());
        }
        else if(ser.getType() == TYPE_SOAP) {
            drawAServiceFeed(ser.getName(), TYPE_SOAP, ser.getWSDL(), ser.getKeywords());
            _feeds_nodes[index].getService().setSoapFunctionId(ser.getSoapFunctionId());
        }
        else if(ser.getType() == TYPE_WIDGET) {
            drawAWidget(ser.getName());
        }
        else if(ser.getType() == TYPE_WORKER) {
            drawAWorker(ser.getName());
        }
    }
}

function Connector(parent_feed) {
    var parent_node = parent_feed.getNode();
    var org_x, org_y;
    var node_x = parent_node.getX() + parent_node.getWidth() - parent_node.getWidth()/2;
    // var node_y = parent_node.getY() + parent_node.getBoxHeight();
    var node_y = parent_node.getY() + parent_node.getHeight();
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
    connector.on("dragstart touchstart", function() {
        org_x = this.getX();
        org_y = this.getY();
    });
    connector.on("dragmove touchmove", function() {
        connectingLine.show();
        connectingLine.setPoints([org_x, org_y, _big_canvas_stage.getMousePosition().x, _big_canvas_stage.getMousePosition().y]);
        this.moveToTop();
    });
    connector.on("dragend touchend touchcancel", function() {
        // reset next feed and beConnectedLine
        if(parentFeed.getNextFeed() != 'undefined' && parentFeed.getNextFeed() != undefined) {
            parentFeed.getNextFeed().setBeConnectedLine('undefined');
        }
        parentFeed.setNextFeed('undefined');

        var mouseX = _big_canvas_stage.getMousePosition().x ||
                     _big_canvas_stage.getTouchPosition().x;
        var mouseY = _big_canvas_stage.getMousePosition().y ||
                     _big_canvas_stage.getTouchPosition().y;

        // firstly check if the connector is released on its own node
        if(ifContains(mouseX, mouseY, parent_node)) {
            connectingLine.hide();
            return;
        }

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
                                    // nodeObj.getNode().getX() + nodeObj.getNode().getBoxWidth()/2,
                                    // nodeObj.getNode().getY() + nodeObj.getNode().getBoxHeight()/2]);
                                    nodeObj.getNode().getX() + nodeObj.getNode().getWidth()/2,
                                    nodeObj.getNode().getY() + nodeObj.getNode().getHeight()/2]);
                _feeds_nodes[index].setBeConnectedLine(connectingLine);

                parentFeed.setNextFeed(nodeObj);

                result = true;

                // check if need to pop up fetchJSONFeed dialog
                if(nodeObj.getService().getType() == TYPE_WORKER) {
                    switch(nodeObj.getService().getName()) {
                        case WORKER_FETCH_LAST_BY_KEY:
                            if(nodeObj.getService().getFetchJSONKey().length == 0) {
                                SysWorkerFeed = nodeObj;
                                showFetchJSONDialog();
                            }
                            break;
                        case WORKER_ADD_TEXT:
                            var obj = nodeObj.getService().getAddTextObject();
                            if(obj.getBeforeText().length ==0 && obj.getAfterText().length == 0) {
                                SysWorkerFeed = nodeObj;
                                showAddTextDialog();
                            }
                            break;
                        case WORKER_TRIM_WHITESPACE:
                            var obj = nodeObj.getService().getTrimWhitespace();
                            if(obj.getReplaceWith().length ==0) {
                                SysWorkerFeed = nodeObj;
                                showTrimWhitespaceDialog();
                            }
                            break;
                        default:
                            break;
                    }
                }

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
                nextFeed.getNode().getX() + nextFeed.getNode().getWidth()/2,
                nextFeed.getNode().getY() + nextFeed.getNode().getHeight()/2]);
                // nextFeed.getNode().getX() + nextFeed.getNode().getBoxWidth()/2,
                // nextFeed.getNode().getY() + nextFeed.getNode().getBoxHeight()/2]);
        nextFeed.setBeConnectedLine(connectingLine);
        parentFeed.setNextFeed(nextFeed);

        // parentFeed.getBox().moveToTop();
        // parentFeed.getNode().moveToTop();
        // if(parentFeed.getType != TYPE_SYS_START) {
        //     parentFeed.getRemoveDot().getBox().moveToTop();
        //     parentRemove.getRemoveDot().getRemoveDot().moveToTop();
        // }
        // nextFeed.getBox().moveToTop();
        // nextFeed.getNode().moveToTop();
        // nextFeed.getRemoveDot().getBox().moveToTop();
        // nextFeed.getRemoveDot().getRemoveDot().moveToTop();

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

    this.getBox = function() {
        return box;
    };

    var start = new Kinetic.Text({
            draggable: true,
            x:  _big_canvas_stage.getWidth() / 2,
            y: 10,
            stroke: '#555',
            strokeWidth: 1.5,
            // fill: '#aaa',
            fill: 'white',
            text: 'Start',
            fontSize: 15,
            fontFamily: 'Arial',
            // textFill: 'white',
            width: 80,
            padding: 10,
            align: 'center'
            // fontStyle: 'italic',
            // shadow: {
            //     color: 'black',
            //     blur: 1,
            //     offset: [5, 5],
            //     opacity: 0.2
            // },
            // cornerRadius: 15
    });

    var box = new Kinetic.Rect({
            draggable: true,
            x:  start.getX(),
            y: start.getY(),
            stroke: '#555',
            strokeWidth: 2,
            fill: '#ddd',
            width: 80,
            height: start.getHeight(),
            shadowColor: 'black',
            // shadowBlur: 1,
            shadowOffset: [5, 5],
            // shadowOpacity: 0.2,
            cornerRadius: 15
    });

    var startConnector = new Connector(this);
    var org_connecting_line_points;

    this.getConnector = function() {
        return startConnector;
    };

    var mouse_over = function() {
        box.setStroke('red');
        _big_canvas_layer.draw();
    };
    var mouse_out = function() {
        box.setStroke('#ddd');
        _big_canvas_layer.draw();
    };

    start.on('mouseover', function() {
        mouse_over();
    });
    start.on('mouseout', function() {
        mouse_out();
    });
    box.on('mouseover', function() {
        mouse_over();
    });
    box.on('mouseout', function() {
        mouse_out();
    });

    var dragstart = function() {
        org_connecting_line_points = startConnector.getConnectingLine().getPoints();
        box.moveToTop();
        start.moveToTop();
        startConnector.getConnector().moveToTop();
        _big_canvas_layer.draw();
    };

    start.on('dragstart', function() {
        dragstart();
    });
    box.on("dragstart", function() {
        dragstart();
    });

    var dragmove = function() {
        moveConnector(startConnector.getConnector(), start);
        if(org_connecting_line_points.length > 1) {
            var org_point = org_connecting_line_points[1];
            startConnector.getConnectingLine().setPoints([startConnector.getConnector().getX(),
                        startConnector.getConnector().getY(), org_point.x, org_point.y]);
        }
        _big_canvas_layer.draw();
    };

    start.on('dragmove', function() {
        box.setX(start.getX());
        box.setY(start.getY());
        dragmove();
    });
    box.on("dragmove", function(){
        start.setX(box.getX());
        start.setY(box.getY());
        dragmove();
    });

    this.getNode = function() {
        return start;
    };

    _feeds_nodes.push(this);

    _big_canvas_layer.add(box);
    _big_canvas_layer.add(start);

    _big_canvas_layer.add(startConnector.getConnector());

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

function redrawFeed(node, feed) {
    var name = feed.getService().getName();
    var type = feed.getService().getType();
    if(type == TYPE_REST) {
        var url = feed.getService().getRestUrl();
        var text = name + '\n(' + feed.getService().getKeywords() + ')\n' + url;
        node.setText(text);
    }
    else if(type == TYPE_SOAP) {
        var wsdl = feed.getService().getWSDL();
        var text = name + '\n(' + feed.getService().getKeywords() + ')\n' + wsdl;
        node.setText(text);
    }
    _big_canvas_layer.draw();
}

function drawAServiceFeed(name, type, url, keywords) {
    var feed;
    if(type === TYPE_REST) {
        feed = new RestFeed(name, url, keywords);
    }
    else if(type === TYPE_SOAP) {
        feed = new SOAPFeed(name, url, keywords);
    }
    _feeds_nodes.push(feed);

    _big_canvas_layer.add(feed.getBox());
    _big_canvas_layer.add(feed.getNode());
    _big_canvas_layer.add(feed.getConnector().getConnector());
    _big_canvas_layer.add(feed.getRemoveDot().getBox());
    _big_canvas_layer.add(feed.getRemoveDot().getRemoveDot());
    _big_canvas_stage.draw();

    return feed;
}

function SOAPFeed(name, wsdl, keywords) {
    return new ServiceFeed(name, wsdl, keywords, TYPE_SOAP);
}

function RestFeed(name, url, keywords) {
    return new ServiceFeed(name, url, keywords, TYPE_REST);
}

function ServiceFeed(name, url, inputKeywords, type) {
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

    var service;
    if(type == TYPE_REST) {
        service = new Service(name, TYPE_REST);
        service.setRestUrl(url);
        service.setRestMethod(REST_METHOD_GET);
    }
    else if(type == TYPE_SOAP) {
       service = new Service(name, TYPE_SOAP);
        service.setWSDL(url);
    }
    service.setKeywords(inputKeywords);
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

    this.getBox = function() {
        return box;
    };

    var feed = new Kinetic.Text({
            draggable: true,
            x: 0,
            y: 0,
            stroke: 'black',
            strokeWidth: 1,
            fill: '#ddf',
            text: name + '\n(' + inputKeywords + ')\n' + url,
            fontSize: 12,
            fontFamily: 'Arial',
            width: 350,
            padding: 10,
            align: 'center'
            // fontStyle: 'italic',
    });
    var box = new Kinetic.Rect({
            draggable: true,
            x: feed.getX(),
            y: feed.getY(),
            stroke: 'black',
            width: feed.getWidth(),
            height: feed.getHeight(),
            fill: '#ddf',
            shadowColor: 'black',
            shadowOffset: [5, 5],
            cornerRadius: 5
    });

    feedConnector = new Connector(this);
    removeDot = new RemoveDot(this);

    this.getConnector = function() {
        return feedConnector;
    };

    var mouse_over = function() {
        feed.setStroke('red');
        box.setStroke('red');
        _big_canvas_layer.draw();
    };
    var mouse_out = function() {
        feed.setStroke('black');
        box.setFill('#ddf');
        box.setStroke('black');
        _big_canvas_layer.draw();
    };
    var mouse_click = function() {
        if(type === TYPE_REST) {
            propertiesPanelShowRestFeed(service);
        }
        else if(type === TYPE_SOAP) {
            propertiesPanelShowSoapFeed(service);
        }
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
        mouse_click();
    });
    feed.on('click', function() {
        mouse_click();
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
        if(org_connecting_line_points.length > 1) {
            var org_point = org_connecting_line_points[1];
            feedConnector.getConnectingLine().setPoints([feedConnector.getConnector().getX(),
                        feedConnector.getConnector().getY(), org_point.x, org_point.y]);
        }

        if(beConnectedLine !== 'undefined') {
            beConnectedLine.setPoints([beConnectedLine.getPoints()[0].x, beConnectedLine.getPoints()[0].y, feed.getX() + feed.getWidth()/2, feed.getY() + feed.getHeight()/2]);
        }

        _big_canvas_layer.draw();
    };

    box.on("dragmove", function() {
        feed.setX(box.getX());
        feed.setY(box.getY());
        moveConnector(feedConnector.getConnector(), feed);
        moveRemoveDot(removeDot.getRemoveDot(), feed);
        removeDot.getBox().setX(removeDot.getRemoveDot().getX());
        removeDot.getBox().setY(removeDot.getRemoveDot().getY());

        dragmove();
    });
    feed.on("dragmove", function() {
        box.setX(feed.getX());
        box.setY(feed.getY());
        moveConnector(feedConnector.getConnector(), feed);
        moveRemoveDot(removeDot.getRemoveDot(), feed);
        removeDot.getBox().setX(removeDot.getRemoveDot().getX());
        removeDot.getBox().setY(removeDot.getRemoveDot().getY());

        dragmove();
    });
}

function ifContains(pointX, pointY, node) {
    var x1 = node.getX();
    var x2 = node.getX() + node.getWidth();
    var y1 = node.getY();
    // var y2 = node.getY() + node.getBoxHeight();
    var y2 = node.getY() + node.getHeight();
    var result;
    if((x1 < pointX) && (x2 > pointX) && (y1 < pointY) && (y2 > pointY)) {
        result = true;
    } else {
        result = false;
    }
    return result;
}

// function drawARect() {
//     var box = new Kinetic.Rect({
//         x: 0,
//         y: 0,
//         fill: 'blue',
//         stroke: 'black',
//         strokeWidth: 2,
//         width: 200,
//         height: 100,
//         draggable: true
//     });
//     _big_canvas_layer.add(box);
//     _big_canvas_stage.add(_big_canvas_layer);
//     _big_canvas_stage.draw();
// }

function updateTrimWhitespaceFeed(value) {
    if(SysWorkerFeed != undefined) {
        var obj = SysWorkerFeed.getService().getTrimWhitespace();
        obj.setReplaceWith(value);
    }
    SysWorkerFeed = undefined;
}

function updateAddTextFeed(before, after) {
    if(SysWorkerFeed != undefined) {
        var addTextObj = SysWorkerFeed.getService().getAddTextObject();
        addTextObj.setBeforeText(before);
        addTextObj.setAfterText(after);
    }
    SysWorkerFeed = undefined;
}

function updateFetchJSONFeed(inputTargetKey) {
    if(SysWorkerFeed != undefined) {
        SysWorkerFeed.getService().setFetchJSONKey(inputTargetKey);
    }
    SysWorkerFeed = undefined;
}

function highlightErrorNode(inputIndex) {
    var counter = 0;
    var feed = _feeds_nodes[0];
    while(counter != inputIndex) {
        feed = feed.getNextFeed();
        ++counter;
    }

    feed.getBox().setFill('yellow');
    _big_canvas_layer.draw();
}


