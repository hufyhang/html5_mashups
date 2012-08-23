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

function showAddFeedForm(containerId) {
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    document.getElementById(containerId).innerHTML = '<table class="frame_table" cellpadding="5px"><tr><td><label>Feed URL: </label><input type="TEXT" id="add_feed_form_feed_url" class="input_box"/></td></tr><tr><td><label>Name: </label><input type="TEXT" id="add_feed_form_feed_name" class="input_box" required="required"/></td></tr><tr><td><label>Type: </label><br /><input type="RADIO" id="add_feed_form_feed_type_rest" name="type" style="margin-left: 50px;" value="REST/HTTP" checked="true">REST/HTTP</input><br /><input type="RADIO" id="add_feed_form_feed_type_soap" name="type" style="margin-left: 50px;" value="SOAP">SOAP</input></td></tr><tr><td><div class="div_push_button" onclick="addFeedFromFeedForm(\''+ containerId + '\')">OK</div><div class="div_push_button" onclick="cancelAddNewFeed(\'' + containerId + '\')">Cancel</div></td></tr></table>';
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

    updateFeedsHTML();
    // close form
    cancelAddNewFeed(containerId);
    showFeedsPanel(_current_container_id);
    });
}

function cancelAddNewFeed(containerId) {
    invisibleElement('dashboard_div');
    invisibleElement('dashboard');
}

function appendFeedsNameList(name) {
    feeds_name_list += name + '\n';
}

function updateFeedsHTML() {
    _database.transaction(function(tx) {
        feeds_html = '<table class="panel_table">';
        tx.executeSql('SELECT name, url, feed_type FROM feeds', [], function(tx, results) {
            for(var index = 0; index != results.rows.length; ++index) {
                var row = results.rows.item(index);
                var name = row['name'];
                test_name = name;
                var type = row['feed_type'];
                feeds_html += '<tr><td><div class="feed_panel_item"><span class="feed_panel_item_type"><strong>' + type + "</strong></span>" + name + '</div></td></tr>';

                appendFeedsNameList(name);
            }
        }, null);
        feeds_html += '</table>'; 
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

