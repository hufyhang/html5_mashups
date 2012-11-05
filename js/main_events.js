var WEB_SQL_DATABASE = 'html5_mashup_platform_web_database';
var DB_VERSION = '1.0';
var DB_TITLE = 'SQL database';
var DB_BYTES = 2 * 1024 * 1024;

var FEED_TYPE_REST = 'rest';
var FEED_TYPE_SOAP = 'soap';

var _database;

var feeds_html = '';
var feeds_name_list = '';

var _current_container_id;

function initialise() {
    readyDatabase();
    updateFeedsHTML();
    // _database.transaction(function(tx) {
        // tx.executeSql('DELETE FROM feeds WHERE name=\'Google Map\'');
    // //     tx.executeSql('DROP TABLE feeds');
    //     // tx.executeSql('INSERT INTO feeds (name, url, feed_type) VALUES ("Yahoo! PlaceFinder", "http://where.yahooapis.com/geocode?", "rest")');
    // });
}

function visibleElement(elementId) {
    document.getElementById(elementId).style.visibility = 'visible';
}

function invisibleElement(elementId) {
    document.getElementById(elementId).style.visibility = 'hidden';
}

function showFeedsPanel(containerId) {
    _current_container_id = containerId;
    document.getElementById(containerId).innerHTML = '<table class="panel_table"><tr><td><div class="div_long_push_button" onclick="showAddFeedForm(\'dashboard_output\')">Add feed...</div></td>' + 
    '</tr></table><hr class="seperator_hr"/>' + feeds_html;
}

function showExecuteInputForm() {
    visibleElement('serviceBoard');
    visibleElement('serviceBoard_div');
    $('#serviceBoard_output').html('<form id="execute_form"><table class="frame_table" cellpadding="5px"><tr><td><label>Data set:</label><br/><input type="TEXT" id="execute_data_input" class="input_box" placeholder="Parameters..." form="execute_form"></td></tr><tr><td><div class="div_push_button" onclick="var executeData=$(\'#execute_data_input\').val(); startIterate(executeData);">Execute</div><div class="div_push_button" onclick="closeServiceBoard()">Cancel</div></td></tr></table></form>');
}

function closeServiceBoard() {
    invisibleElement('serviceBoard');
    invisibleElement('serviceBoard_div');
}

function showAddFeedForm(containerId) {
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    document.getElementById(containerId).innerHTML = '<form id="the_form"><table class="frame_table" cellpadding="5px"><tr><td><label>Feed URL: </label><br /><input type="TEXT" id="add_feed_form_feed_url" class="input_box" placeholder="Feed URL" required="required" form="the_form"/></td></tr><tr><td><label>Name: </label><br /><input type="TEXT" id="add_feed_form_feed_name" class="input_box" placeholder="Feed name" required="required" form="the_form"/></td></tr><tr><td><label>Type: </label><br /><input type="RADIO" id="add_feed_form_feed_type_rest" name="type" style="margin-left: 50px;" value="REST/HTTP" checked="true"/><label for="add_feed_form_feed_type_rest">REST/HTTP</label><br /><input type="RADIO" id="add_feed_form_feed_type_soap" name="type" style="margin-left: 50px;" value="SOAP" /><label for="add_feed_form_feed_type_soap">SOAP</label></td></tr><tr><td><div class="div_push_button" onclick="addFeedFromFeedForm(\''+ containerId + '\')">OK</div><div class="div_push_button" onclick="closeAddNewFeed(\'' + containerId + '\')">Cancel</div></td></tr></table></form>';
}

function addFeedFromFeedForm(containerId) {
    var url = document.getElementById('add_feed_form_feed_url').value;
    var name = document.getElementById('add_feed_form_feed_name').value;
    var type_rest = document.getElementById('add_feed_form_feed_type_rest');
    var type_soap = document.getElementById('add_feed_form_feed_type_soap');
    var type;

    if(url.length == 0) {
        alert('Feed URL cannot be empty.');
        return;
    }
    if(name.length == 0) {
        alert('Feed name cannot be empty.');
        return;
    }

    if(feeds_name_list.indexOf(name) != -1) {
        alert('Feed name already in use, please choose another one.');
        return;
    }

    if(type_rest.checked) {
        type = FEED_TYPE_REST;
    }
    else if(type_soap.checked) {
        type = FEED_TYPE_SOAP;
    }

    // insert into database
    _database.transaction(function(tx) {
        tx.executeSql('INSERT INTO feeds (name, url, feed_type) VALUES (\"' + name + '\", \"' + url +'\", \"' + type + '\")');

        document.getElementById('add_feed_form_feed_url').value = document.getElementById('add_feed_form_feed_name').value = '';
        showNotificationInDashboard('Feed "' + name + '" has been added.');
    });
}

function closeAddNewFeed(containerId) {
    invisibleElement('dashboard_div');
    invisibleElement('dashboard');
    showFeedsPanel(_current_container_id);
}

function clearFeedsNameList() {
    feeds_name_list = "";
}

function appendFeedsNameList(name) {
    feeds_name_list += name + '\n';
}

function updateFeedsHTML() {
    _database.transaction(function(tx) {
        clearFeedsNameList();
        feeds_html = '<table class="panel_table">';
        tx.executeSql('SELECT name, url, feed_type FROM feeds', [], function(tx, results) {
            for(var index = 0; index != results.rows.length; ++index) {
                var row = results.rows.item(index);
                var name = row['name'];
                var url = row['url'];
                var type = row['feed_type'];
                feeds_html += '<tr><td><div class="feed_panel_item" onclick="drawARestFeed(\'' + name + '\', \'' + url + '\')"><img class="feed_delelte_img" onclick="removeFeedFromFeedList(\'' + name + '\')" src="img/remove_normal.png" width="15px" height="15px" /><span class="feed_panel_item_type"><strong>' + type + "</strong></span>" + name + '</div></td></tr>';
                appendFeedsNameList(name);
            }
        }, null);
        feeds_html += '</table>'; 
    });
}

function showNotificationInDashboard(msg) {
    // show message
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    document.getElementById('dashboard_output').innerHTML = '<table class="frame_table"><tr><td>' + msg +'</td></tr><tr><td><div class="div_push_button" onmouseover="updateFeedsHTML()" onclick="showFeedsPanel(_current_container_id);invisibleElement(\'dashboard_div\');invisibleElement(\'dashboard\');">OK</div></td></tr></table>'
    ;
}

function removeFeedFromFeedList(name) {
    removeFeedFromDatabase(name);
    showNotificationInDashboard('Feed "' + name + '" has been removed.');

//     updateFeedsHTML();
//     showFeedsPanel(_current_container_id);
}

function removeFeedFromDatabase(name) {
    _database.transaction(function(tx) {
        tx.executeSql('DELETE FROM feeds WHERE name="' + name + '"');
    });
}

function readyDatabase() {
    _database = openDatabase(WEB_SQL_DATABASE, DB_VERSION, DB_TITLE, DB_BYTES);
    // check & create table
    _database.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS feeds (name, url, feed_type)');
    }
    );
}

function propertiesPanelShowRestFeed(service) {
    var name = service.getName();
    var url = service.getRestUrl();
    var method = service.getRestMethod();
    var id = service.getId();

    var feed_method_html = '';
    if(method == 'get' || method == 'GET') {
        feed_method_html = '<input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_get" checked="true" /><label for="properties_panel_rest_feed_method_get">GET</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_post" /><label for="properties_panel_rest_feed_method_post">POST</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_put"/><label for="properties_panel_rest_feed_method_put">PUT</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_delete"/><label for="properties_panel_rest_feed_method_delete">DELETE</label>';
    }
    else if(method == 'post' || method == 'POST') {
        feed_method_html = '<input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_get" /><label for="properties_panel_rest_feed_method_get">GET</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_post" checked="true" /><label for="properties_panel_rest_feed_method_post">POST</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_put"/><label for="properties_panel_rest_feed_method_put">PUT</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_delete"/><label for="properties_panel_rest_feed_method_delete">DELETE</label>';
    }
    else if(method == 'put' || method == 'PUT') {
        feed_method_html = '<input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_get" /><label for="properties_panel_rest_feed_method_get">GET</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_post" /><label for="properties_panel_rest_feed_method_post">POST</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_put" checked="true"/><label for="properties_panel_rest_feed_method_put">PUT</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_delete"/><label for="properties_panel_rest_feed_method_delete">DELETE</label>';
    }  
    else if(method == 'delete' || method == 'DELETE') {
        feed_method_html = '<input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_get" /><label for="properties_panel_rest_feed_method_get">GET</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_post" /><label for="properties_panel_rest_feed_method_post">POST</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_put" /><label for="properties_panel_rest_feed_method_put">PUT</label><br/><input type="RADIO" name="rest_feed_method" id="properties_panel_rest_feed_method_delete" checked="true"/><label for="properties_panel_rest_feed_method_delete">DELETE</label>';
    }  

    document.getElementById('properties_panel_output').innerHTML = '<table class="properties_panel_table"><tr><td>Name:<br/><input type="TEXT" class="input_box" disabled="disabled" value="' + name + '"/></td></tr><tr><td>URL:<br/><input type="TEXT" class="input_box" disabled="disabled" value="' + url + '"></td></tr><tr><td><form>Method:<br/><div style="margin-left: 30px;">' + feed_method_html + '</div></form></td></tr><tr><td style="vertical-align: top;"><div class="div_push_button" onclick="applyRestMethodUpdate(' + id + ')">Apply</div></td></tr></table>';
}

function applyRestMethodUpdate(id) {
    var method;
    if(document.getElementById('properties_panel_rest_feed_method_get').checked) {
        method = REST_METHOD_GET;
    }
    else if(document.getElementById('properties_panel_rest_feed_method_post').checked) {
        method = REST_METHOD_POST;
    }
    else if(document.getElementById('properties_panel_rest_feed_method_put').checked) {
        method = REST_METHOD_PUT;
    }
    else if(document.getElementById('properties_panel_rest_feed_method_delete').checked) {
        method = REST_METHOD_DELETE;
    }
    updateRestMethodById(id, method);
}
