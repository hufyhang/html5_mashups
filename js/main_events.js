const WEB_SQL_DATABASE = 'html5_mashup_platform_web_database';
const DB_VERSION = 2;
const DB_TITLE = 'SQL database';
const DB_BYTES = 2 * 1024 * 1024;

const INDEXEDDB_DATABASE = 'html5_mashup_platform_web_database';
const INDEXEDDB_VERSION = '1.0';
const INDEXEDDB_STORE = 'projects';

const SHOW_PROJECTS = 'showProject';

const FEED_TYPE_REST = 'rest';
const FEED_TYPE_SOAP = 'soap';

var _database, idb;
var _log;

var feeds_html = '';
var feeds_name_list = '';

var _current_container_id;
var _currentPlace = undefined;

function initialise() {
    _log = '';
    appendLog('Session start.');

    readyDatabase();
    updateFeedsHTML();
    readProjects('options_field_output');
}

function appendLog(msg) {
    var now = new Date();
    _log += '[' + now.toTimeString() + '] ' + msg + '<br/><br/>';
}

function showLogDialog() {
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    $('#dashboard_output').html('<div>System Log</div><hr/><table style="width: 100%;"><tr><td><div id="logMessageDiv" style="overflow: auto; width: 40em; height: 300px; background:grey; padding-left: 5px; padding-right: 5px;">' + _log + '</div></td></tr><tr><td align="center"><div class="div_push_button" onclick="_log = \'\';$(\'#logMessageDiv\').html(\'\');">Clear</div><div class="div_long_push_button" onclick="invisibleElement(\'dashboard\');invisibleElement(\'dashboard_div\');$(\'#dashboard_output\').html(\'\');">Close</div></td></tr></table>');

}

function visibleElement(elementId) {
    document.getElementById(elementId).style.visibility = 'visible';
}

function invisibleElement(elementId) {
    document.getElementById(elementId).style.visibility = 'hidden';
}

function resetCurrentPlace() {
    _currentPlace = undefined;
}

function showFeedsPanel(containerId) {
    _current_container_id = containerId;
    document.getElementById(containerId).innerHTML = '<table class="panel_table"><tr><td><table><tr><td><div>Feeds</div></td><td><div class="div_push_button" onclick="showAddFeedForm(\'dashboard_output\')">Add feed...</div><div class="div_push_button" onclick="loadFeedMarket();">Feed Market</div></td></tr></table></td>' + 
    '</tr></table><hr class="seperator_hr"/>' + feeds_html;
}

function showWorkersPanel(containerId) {
    _current_container_id = containerId;
    $('#'+ containerId).html('<div>Workers</div><hr class="seperator_hr" /><table class="panel_table" style="margin-left:20px;width: 93%;"><tr><td nowrap=\'nowrap\' width=\"100%\"><div class="feed_panel_item" onclick="drawAWorker(\'' + WORKER_FETCH_LAST_BY_KEY + '\');">Fetch Data</div></td></tr><tr><td nowrap=\'nowrap\' width=\"100%\"><div class="feed_panel_item" onclick="drawAWorker(\'' + WORKER_ADD_TEXT + '\');">Add Text</div></td></tr><tr><td nowrap=\'nowrap\' width=\"100%\"><div class="feed_panel_item" onclick="drawAWorker(\'' + WORKER_GEO_TEXT + '\');">Geolocation (Default)</div></td></tr><tr><td nowrap=\'nowrap\' width=\"100%\"><div class="feed_panel_item" onclick="drawAWorker(\'' + WORKER_GEO_JSON + '\');">Geolocation (JSON)</div></td></tr><tr><td nowrap=\'nowrap\' width=\"100%\"><div class="feed_panel_item" onclick="drawAWorker(\'' + WORKER_OUTPUT + '\');">Show Output</div></td></tr><tr><td nowrap=\'nowrap\' width=\"100%\"><div class="feed_panel_item" onclick="drawAWorker(\'' + WORKER_TRIM_WHITESPACE + '\');">Trim & Replace Whitespace</div></td></tr><tr><td nowrap=\'nowrap\' width=\"100%\"><div class="feed_panel_item" onclick="drawAWorker(\'' + WORKER_REMOVE_SPECIAL + '\');">Remove Special Characters</div></td></tr></table>');
}

function showWidgetsPanel(containerId) {
    _current_container_id = containerId;
    $('#'+ containerId).html('<div>Widgets</div><hr class="seperator_hr" /><table class="panel_table" style="margin-left:20px;width: 93%;"><tr><td nowrap=\'nowrap\' width=\"100%\"><div class="feed_panel_item" onclick="drawAWidget(\'' + WIDGET_AUDIO + '\');">HTML5 Audio</div></td></tr><tr><td nowrap=\'nowrap\' width=\"100%\"><div class="feed_panel_item" onclick="drawAWidget(\'' + WIDGET_VIDEO + '\');">HTML5 Video</div></td></tr><tr><td nowrap=\'nowrap\' width=\"100%\"><div class="feed_panel_item" onclick="drawAWidget(\'' + WIDGET_IMAGE + '\');">HTML5 Image</div></td></tr></table>');
}


function showExecuteInputForm() {
    visibleElement('serviceBoard');
    visibleElement('serviceBoard_div');
    $('#serviceBoard_output').html('<form id="execute_form"><table class="frame_table" cellpadding="5px"><tr><td><label>Dataset:</label><br/><input type="TEXT" id="execute_data_input" class="input_box" placeholder="Parameters..." form="execute_form"></td></tr><tr><td><div id="execute_run_button" class="div_push_button" onclick="var executeData=$(\'#execute_data_input\').val(); startIterate(executeData);">Run</div><div class="div_push_button" onclick="closeServiceBoard(); invisibleElement(\'activity_indicator\'); invisibleElement(\'executionFullScreenToggleButton\');$(\'#execute_output\').html(\'\');">Close</div><div style="display: table-cell; padding-left: 10px; padding-right: 10px;"><img id="activity_indicator" style="display: table-cell;" width="30px" height="30px" src="img/indicator.png"/></div><div id="executionFullScreenToggleButton" class="div_long_push_button" onclick="fullscreenFirstElementChild(\'execute_output\');">Toggle fullscreen</div></td></tr><tr><td><output id="execute_output"></output></td></tr></table></form>');

    $('#execute_data_input').focus();

    $('#execute_data_input').keypress(function(evt) {
        if(evt.keyCode == 13) { // if enter hit
            evt.preventDefault();
            $('#execute_run_button').click();
            return false;
        }
    });
}

function fullscreenFirstElementChild(inputElementId) {
    var el = document.getElementById(inputElementId).firstElementChild;
    if(el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
    }
    else if(el.mozRequestFullScreen) {
        el.mozRequestFullScreen;
    }
    else {
        el.requestFullscreen();
    }
}

function closeServiceBoard() {
    invisibleElement('serviceBoard');
    invisibleElement('serviceBoard_div');
}

function showAddFeedForm(containerId) {
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    document.getElementById(containerId).innerHTML = '<form id="the_form"><table class="frame_table" cellpadding="5px"><tr><td><label>Name: </label><br /><input type="TEXT" id="add_feed_form_feed_name" class="input_box" placeholder="Feed name" required="required" form="the_form"/></td></tr><tr><td><label>Feed URL: </label><br /><input type="TEXT" id="add_feed_form_feed_url" class="input_box" placeholder="Feed URL" required="required" form="the_form"/></td></tr><tr><td><label>Keywords: </label><br /><input type="TEXT" class="input_box" id="add_feed_form_feed_keyword" placeholder="Please enter keywords (e.g. service, example, map)" required="required" form="the_form"/></td></tr><tr><td><label>Type: </label><br /><input type="RADIO" id="add_feed_form_feed_type_rest" name="type" style="margin-left: 50px;" value="REST/HTTP" checked="true"/><label for="add_feed_form_feed_type_rest">REST/HTTP</label><br /><input type="RADIO" id="add_feed_form_feed_type_soap" name="type" style="margin-left: 50px;" value="SOAP" /><label for="add_feed_form_feed_type_soap">SOAP</label></td></tr><tr><td><div class="div_push_button" onclick="addFeedFromFeedForm(\''+ containerId + '\')">OK</div><div class="div_push_button" onclick="closeAddNewFeed(\'' + containerId + '\')">Cancel</div></td></tr></table></form>';
}

function addFeedFromFeedForm(containerId) {
    var url = document.getElementById('add_feed_form_feed_url').value;
    var name = document.getElementById('add_feed_form_feed_name').value;
    var keywords = document.getElementById('add_feed_form_feed_keyword').value;
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

    if(keywords.length == 0) {
        alert('Please declare at least one keyword.');
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
        tx.executeSql('INSERT INTO feeds (name, url, feed_type, keyword) VALUES (\"' + name + '\", \"' + url +'\", \"' + type + '\", \"' + keywords + '\")');

        document.getElementById('add_feed_form_feed_url').value = document.getElementById('add_feed_form_feed_name').value = '';
        updateFeedsHTML();
        showNotificationInDashboard('Feed "' + name + '" has been added.');
    });
}

function insertFeedIntoHyperMash(name, url, type, keywords) {
    // insert into database
    _database.transaction(function(tx) {
        tx.executeSql('INSERT INTO feeds (name, url, feed_type, keyword) VALUES (\"' + name + '\", \"' + url +'\", \"' + type + '\", \"' + keywords + '\")');
        updateFeedsHTML();
        showNotificationInDashboard('Feed "' + name + '" has been added.');
    });
}

function insertProjectIntoHyperMash(inputMd5, inputName, inputJson, inputKeywords) {
    var json = inputJson;
    _database.transaction(function(tx) {
        var md5 = inputMd5;
        tx.executeSql('INSERT INTO projects (md5, name, json, keyword) VALUES (\'' + md5 + '\', \'' + inputName + '\', \'' + json + '\', \'' + inputKeywords + '\')');
        updateFeedsHTML();
        showNotificationInDashboard('"' + inputName + '" has been saved.');
        appendLog('Project \"' + inputName + '\" with MD5 \"' + md5 + '\" has been added from Project Market.');
    });

    // idb.transaction(INDEXEDDB_STORE, IDBTransaction.READ_WRITE).objectStore(INDEXEDDB_STORE).add({name: inputName, json: json}).onsuccess = function(evt) {
    //     showNotificationInDashboard(inputName + " has been saved.");
    // };
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
        tx.executeSql('SELECT * FROM feeds', [], function(tx, results) {
            for(var index = 0; index != results.rows.length; ++index) {
                var row = results.rows.item(index);
                var name = row['name'];
                var url = row['url'];
                var type = row['feed_type'];
                var keywords = row['keyword'];
                feeds_html += '<tr><td><table cellpadding="0px" cellsapcing="0px"><tr><td><div id="feed_panel_item_table" class="feed_delelte_img" onclick="removeFeedFromFeedList(\'' + name + '\')" width="15px" height="15px">&nbsp;&nbsp;&nbsp;&nbsp;</div></center></td><td nowrap="nowrap" width="100%"><div class="feed_panel_item" onclick="drawARestFeed(\'' + name + '\', \'' + url + '\', \'' + keywords + '\')"><span class="feed_panel_item_type"><strong>' + type + "</strong></span>" + name + '</div></td></tr></table></td></tr>';
                appendFeedsNameList(name);
            }
        }, null);
        feeds_html += '</table>'; 
    });
}

function showBackupServiceDialog(targetIndex, keyword) {
    _database.transaction(function(tx) {
        tx.executeSql('SELECT * FROM feeds WHERE keyword LIKE \'%' + keyword + '%\'', [], function(tx, results) {
            var html = '<div class="scrollable_div" style="max-height: 250px;"><table class="frame_table">';
            var items = '';
            for(var index = 0; index != results.rows.length; ++index) {
                var row = results.rows.item(index);
                var name = row['name'];
                var url = row['url'];
                var type = row['feed_type'];
                var keywords = row['keyword'];
                var onclick = '';
                if(type == TYPE_REST) {
                    onclick = 'replaceRestFeed(' + targetIndex + ', \'' + name + '\', \'' + url + '\', \'' + keywords + '\');invisibleElement(\'dashboard_div\');invisibleElement(\'dashboard\');';
                }
                items += '<tr><td nowrap="nowrap" width="100%"><div class="feed_panel_item" onclick="' + onclick + '"><span class="feed_panel_item_type"><strong>' + type + "</strong></span>" + name + '</div></td></tr>';
            }
            if(items.length == 0) {
                items = '<tr><td>Oops! There is no suggestions available.</td></tr>';
            }
            html += items;
            html += '</table></div>';
            $('#replace_service_output').html(html);
        }, null);
    });
}

function showReplaceServiceByKeywordDialog(targetIndex, keywords) {
    if(keywords.length == 0) {
        showMessageDialog('Sorry, no suggestions available for this service.');
        return;
    }

    var html = '<div>Please choose one of the possible keywords for replacing the unavailable service.</div><div class="scrollable_div" style="max-height: 200px;"><table class="frame_table">';
    var items = keywords.split(',');
    for(var index = 0; index != items.length; ++index) {
        var item = $.trim(items[index]);
        html += '<tr><td><div class="feed_panel_item" onclick="showBackupServiceDialog(' + targetIndex + ', \'' + item + '\');">' + item + '</div></td></tr>';
    }
    html += '</table></div><table class="frame_table"><tr><td><hr class="seperator_hr"/><output id="replace_service_output" style="height: 60px;"></output></td></tr></table><div class="div_push_button" onclick="invisibleElement(\'dashboard_div\'); invisibleElement(\'dashboard\');">Close</div>';
    $('#dashboard_output').html(html);
}

function showSaveProjectDialog() {
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    $('#dashboard_output').html('<table class="frame_table"><tr><td>Save as:</td></tr><tr><td><input width="100%" type="TEXT" id="save_project_name_input" class="input_box" placeholder="Please give a name to your project..."/></td></tr><tr><td><label>Keywords:</label><br/><input type="TEXT" class="input_box" id="save_project_keyword_input" placeholder="Please identify keywords (e.g. mashup, example)" /></td></tr><tr><td><div id="save_project_button" class="div_push_button" onclick="saveAProjectFromDialog();invisibleElement(\'dashboard\');invisibleElement(\'dashboard_div\');">Save</div><div class="div_push_button" onclick="invisibleElement(\'dashboard\');invisibleElement(\'dashboard_div\');">Cancel</div></td></tr></table>');

    $('#save_project_name_input, #save_project_keyword_input').keypress(function(evt) {
        if(evt.keyCode == 13) { // if enter up
            evt.preventDefault();
            $('#save_project_button').click();
            return false;
        }
    });

}

function showRemoveProjectDialog(md5, name) {
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    $('#dashboard_output').html('<table class="frame_table"><tr><td><div>Are you sure you want to remove \"' + name + '\"?</div></td></tr><tr><td><div class="div_push_button" onclick="removeAProject(\'' + md5 + '\');invisibleElement(\'dashboard\');invisibleElement(\'dashboard_div\');">Yes</div><div class="div_push_button" onclick="invisibleElement(\'dashboard\');invisibleElement(\'dashboard_div\');">No</div></td></tr></table>');
}

function showServiceErrorDialog(msg, targetIndex, keywords) {
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    document.getElementById('dashboard_output').innerHTML = '<table class="frame_table"><tr><td>' + msg +'</td></tr><tr><td><div class="div_push_button" onclick="showReplaceServiceByKeywordDialog(' + targetIndex + ', \'' + keywords + '\')">Suggestion</div><div class="div_push_button" onclick="invisibleElement(\'dashboard_div\');invisibleElement(\'dashboard\');">Close</div></td></tr></table>';
}

function showTrimWhitespaceDialog() {
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    $('#dashboard_output').html('<table class="frame_table"><tr><td><label>Replace whitespace with:</label><br/><input type="TEXT" class="input_box" id="ReplaceWhitespaceWithDialogInput" placeholder="Keep blank to remove whitespace."/></td></tr><tr><td><div id="trimWhitespace_dialog_ok" class="div_push_button" onclick="updateTrimWhitespaceFeed($(\'#ReplaceWhitespaceWithDialogInput\').val()); invisibleElement(\'dashboard_div\'); invisibleElement(\'dashboard\');">OK</div></td></tr></table>');

    $('#ReplaceWhitespaceWithDialogInput').keypress(function(evt) {
        if(evt.keyCode == 13) {
            evt.preventDefault();
            $('#trimWhitespace_dialog_ok').click();
            return false;
        }
    });
}

function showAddTextDialog() {
    // show message
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    $('#dashboard_output').html('<table class="frame_table"><tr><td><label>Before:</label><br/><input type="TEXT" class="input_box" id="AddTextDialogBefore" placeholder="Please specify the text which will be added before the output of the previous connected node..."/></td></tr><tr><td><label>After:</label><br/><input type="TEXT" class="input_box" id="AddTextDialogAfter" placeholder="Please specify the text which will be added after the output of the previous connected node..."/></td></tr><tr><td><div id="addText_dialog_ok" class="div_push_button" onclick="updateAddTextFeed($(\'#AddTextDialogBefore\').val(), $(\'#AddTextDialogAfter\').val()); invisibleElement(\'dashboard_div\'); invisibleElement(\'dashboard\');">OK</div></td></tr></table>');

    $('#AddTextDialogBefore, #AddTextDialogAfter').keypress(function(evt) {
        if(evt.keyCode == 13) {
            evt.preventDefault();
            $('#addText_dialog_ok').click();
            return false;
        }
    });

}

function showFetchJSONDialog() {
    // show message
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    $('#dashboard_output').html('<table class="frame_table"><tr><label>Target Key:</label><br/><input type="TEXT" id="fetchJSON_dialog_key_input" class="input_box" placeholder="Please identify the target key to be fetched."/></tr><tr><td><div id="fetchJSON_dialog_ok_button" class="div_push_button" onclick="updateFetchJSONFeed($(\'#fetchJSON_dialog_key_input\').val()); invisibleElement(\'dashboard_div\'); invisibleElement(\'dashboard\');">OK</div></td></tr></table>');

    $('#fetchJSON_dialog_key_input').keypress(function(evt) {
        if(evt.keyCode == 13) {
            evt.preventDefault();
            $('#fetchJSON_dialog_ok_button').click();
            return false;
        }
    });
}

function showMessageDialog(msg) {
    // show message
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    document.getElementById('dashboard_output').innerHTML = '<table class="frame_table"><tr><td>' + msg +'</td></tr><tr><td><div class="div_push_button" onclick="invisibleElement(\'dashboard_div\');invisibleElement(\'dashboard\');">OK</div></td></tr></table>';
}

function showNotificationInDashboard(msg) {
    // show message
    visibleElement('dashboard');
    visibleElement('dashboard_div');
    document.getElementById('dashboard_output').innerHTML = '<table class="frame_table"><tr><td>' + msg +'</td></tr><tr><td><div class="div_push_button" onclick="if(_currentPlace == SHOW_PROJECTS){readProjects(\'options_field_output\');} else{showFeedsPanel(_current_container_id);}invisibleElement(\'dashboard_div\');invisibleElement(\'dashboard\');">OK</div></td></tr></table>';
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
        updateFeedsHTML();
    });
}

// This function is created by Max Aller <nanodeath@gmail.com>
function Migrator(db){
  var migrations = [];
  this.migration = function(number, func){
    migrations[number] = func;
  };
  var doMigration = function(number){
    if(migrations[number]){
      db.changeVersion(db.version, String(number), function(t){
        migrations[number](t);
      }, function(err){
        if(console.error) console.log("WebSQL Migrator: %o", err);
      }, function(){
        doMigration(number+1);
      });
    }
  };
  this.doIt = function(){
    var initialVersion = parseInt(db.version) || 0;
    try {
      doMigration(initialVersion+1);
    } catch(e) {
      if(console.error) console.error(e);
    }
  };
}

function readyDatabase() {
    _database = openDatabase(WEB_SQL_DATABASE, '', DB_TITLE, DB_BYTES);
    // check & create table
    var migrator = new Migrator(_database);
    migrator.migration(1, function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS feeds (name, url, feed_type)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS projects (md5 NOT NULL PRIMARY KEY, name, json)');
    });
    migrator.migration(2, function(tx) {
        tx.executeSql('ALTER TABLE feeds ADD keyword varchar(255)');
        tx.executeSql('ALTER TABLE projects ADD keyword varchar(255)');
    });

    migrator.doIt();

    // _database.transaction(function(tx) {
    //     tx.executeSql('CREATE TABLE IF NOT EXISTS feeds (name, url, feed_type, keyword)');
    //     tx.executeSql('CREATE TABLE IF NOT EXISTS projects (md5 NOT NULL PRIMARY KEY, name, json, keyword)');
    // });

// 
//     // now, initialise Indexed DB
//     // In the following line, you should include the prefixes of implementations you want to test.
//     window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
//     // DON'T use "var indexedDB = ..." if you're not in a function.
//     // Moreover, you may need references to some window.IDB* objects:
//     window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
//     window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
//     // (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)
//     if (!window.indexedDB) {
//        window.alert("Your browser doesn't support a stable version of IndexedDB. Load and Save features will not be available.");
//        return;
//     }
// 
//     var request = indexedDB.open(INDEXEDDB_DATABASE, INDEXEDDB_VERSION);
//     request.onsuccess = function(evt) {
//         idb = request.result;
//         readProjects('options_field_output');
//     };
// 
//     request.onerror = function(evt) {
//         console.log("IndexedDB error: " + evt.target.errorCode);
//     };
// 
//     request.onupgradeneeded = function(evt) {
//         var objectStore = evt.currentTarget.result.createObjectStore(INDEXEDDB_STORE, {keyPath: "id", autoIncrement:true});
//         objectStore.createIndex("name", "name", {unique: false});
//         objectStore.createIndex("json", "json", {unique: false});
//     };
}

function readProjects(containerId) {
    _currentPlace = SHOW_PROJECTS;
    _database.transaction(function(tx) {
        var html = '<table><tr><td><div>Existing projects</div></td><td><div class="div_long_push_button" onclick="loadProjectMarket();">Project Market</div></td></tr></table><hr class="seperator_hr" /><table class="panel_table">';
        tx.executeSql('SELECT md5, name, json FROM projects', [], function(tx, results) {
            for(var index = 0; index != results.rows.length; ++index) {
                var row = results.rows.item(index);
                var md5 = row['md5'];
                var name = row['name'];
                html += '<tr><td><table cellpadding="0px" cellsapcing="0px" style="width:100%;"><tr><td><center><div id="feed_panel_item_table" class="feed_delelte_img" onclick="showRemoveProjectDialog(\'' + md5 + '\', \'' + name + '\');" width="15px" height="15px">&nbsp;&nbsp;&nbsp;&nbsp;</div></center></td><td nowrap="nowrap" width="100%"><div class="feed_panel_item" onclick="readAProject(\'' + md5 + '\')">' + name + '</div></td></tr></table></td></tr>';
            }
            html += '</table>';
            $('#' + containerId).html(html);
        }, null);
    });

// 
//     var objectStore = idb.transaction(INDEXEDDB_STORE, IDBTransaction.READ_ONLY).objectStore(INDEXEDDB_STORE);
//     objectStore.openCursor().onsuccess = function(evt) {
//         var cursor = evt.target.result;
//         if(cursor) {
//             var id = cursor.key;
//             var name = cursor.value.name;
//             cursor.continue();
//         }
//     };
}

function readAProject(md5) {
    _database.transaction(function(tx) {
        tx.executeSql('SELECT json FROM projects WHERE md5="' + md5 + '"', [], function(tx, results) {
            var json = '';
            for(var index = 0; index != results.rows.length; ++index) {
                var row = results.rows.item(index);
                json = row['json'];
            }
            loadFromJSON(json);            
        }, null);
    });

    // var getRequest = idb.transaction(INDEXEDDB_STORE, IDBTransaction.READ_ONLY).objectStore(INDEXEDDB_STORE).get(id);
    // getRequest.onsuccess = function(evt) {
    //     loadFromJSON(getRequest.result.json);
    // };
}

function removeAProject(md5) {
    _database.transaction(function(tx) {
        tx.executeSql('DELETE FROM projects WHERE md5="' + md5 + '"');
        if(_currentPlace == SHOW_PROJECTS) {
            readProjects('options_field_output');
            appendLog('Project with MD5 \"' + md5 + '\" has been removed.');
        }
    });

    // idb.transaction(INDEXEDDB_STORE, IDBTransaction.READ_WRITE).objectStore(INDEXEDDB_STORE).delete(id).onsuccess = function(evt) {
    //     if(_currentPlace == SHOW_PROJECTS) {
    //         readProjects('options_field_output');
    //     }
    // };
}

function saveAProject(inputName, inputJson, inputKeywords) {
    var json = inputJson;
    _database.transaction(function(tx) {
        var md5 = MD5(new Date() + inputName);
        tx.executeSql('INSERT INTO projects (md5, name, json, keyword) VALUES (\'' + md5 + '\', \'' + inputName + '\', \'' + json + '\', \'' + inputKeywords + '\')');
        showNotificationInDashboard('"' + inputName + '" has been saved.');
        appendLog('Project \"' + inputName + '\" has been saved.');
    });

    // idb.transaction(INDEXEDDB_STORE, IDBTransaction.READ_WRITE).objectStore(INDEXEDDB_STORE).add({name: inputName, json: json}).onsuccess = function(evt) {
    //     showNotificationInDashboard(inputName + " has been saved.");
    // };
}

function saveAProjectFromDialog() {
    var name = $('#save_project_name_input').val();
    var keywords = $('#save_project_keyword_input').val();
    if(name.length == 0) {
        alert('Project name cannot be empty.');
        return;
    }
    if(keywords.length == 0) {
        alert('Please identify at least one keyword.');
        return;
    }
    var json = getFeedsJSON();
    saveAProject(name, json, keywords);
}

function propertiesPanelShowSysWorker(service) {
    var name = service.getName();
    var key = service.getFetchJSONKey();
    var id = service.getId();
    var beforeText = service.getAddTextObject().getBeforeText();
    var afterText = service.getAddTextObject().getAfterText();
    var trimWith = service.getTrimWhitespace().getReplaceWith();
    

    switch(name) {
        case WORKER_FETCH_LAST_BY_KEY:
            document.getElementById('properties_panel_output').innerHTML = '<table class="properties_panel_table"><tr><td>Target Key:<br/><input type="TEXT" class="input_box" id="SysworkerPropertiesTargetKey" placeholder="Please enter the target key..." value="' + key + '"/></td></tr></table>';

            $('#SysworkerPropertiesTargetKey').change(function() {
                var data = $('#SysworkerPropertiesTargetKey').val();
                service.setFetchJSONKey(data);
            });
            break;

        case WORKER_TRIM_WHITESPACE:
            $('#properties_panel_output').html('<table class="properties_panel_table"><tr><td>Replace Whitespace with:<br/><input type="TEXT" class="input_box" id="SysworkerPropertiesReplaceWhitespaceWith" placeholder="Keep empty to remove whitespace." value="' + trimWith + '"/></td></tr></table>');

            $('#SysworkerPropertiesReplaceWhitespaceWith').change(function() {
                service.getTrimWhitespace().setReplaceWith($('#SysworkerPropertiesReplaceWhitespaceWith').val());
            });
            break;

        case WORKER_ADD_TEXT:
            $('#properties_panel_output').html('<table class="properties_panel_table"><tr><td><label>Before:</label><br/><input type="TEXT" class="input_box" id="SysworkerPropertiesAddTextBefore" placeholder="Please specify the text which will be added before the output of the previous connected node..." value="' + beforeText + '"/></td></tr><tr><td><label>After:</label><br/><input type="TEXT" class="input_box" id="SysworkerPropertiesAddTextAfter" placeholder="Please specify the text which will be added after the output of the previous connected node..." value="' + afterText + '"/></td></tr></table>');

            $('#SysworkerPropertiesAddTextAfter, #SysworkerPropertiesAddTextBefore').change(function() {
                var before = $('#SysworkerPropertiesAddTextBefore').val();
                var after = $('#SysworkerPropertiesAddTextAfter').val();
                service.getAddTextObject().setBeforeText(before);
                service.getAddTextObject().setAfterText(after);
            });
            break;

        default:
            break;
    }
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

    // document.getElementById('properties_panel_output').innerHTML = '<table class="properties_panel_table"><tr><td>Name:<br/><input type="TEXT" class="input_box" disabled="disabled" value="' + name + '"/></td></tr><tr><td>URL:<br/><input type="TEXT" class="input_box" disabled="disabled" value="' + url + '"></td></tr><tr><td><form>Method:<br/><div style="margin-left: 30px;">' + feed_method_html + '</div></form></td></tr><tr><td style="vertical-align: top;"><div class="div_push_button" onclick="applyRestMethodUpdate(' + id + ')">Apply</div></td></tr></table>';

    document.getElementById('properties_panel_output').innerHTML = '<table class="properties_panel_table"><tr><td>Name:<br/><input type="TEXT" class="input_box" disabled="disabled" value="' + name + '"/></td></tr><tr><td>URL:<br/><input type="TEXT" class="input_box" disabled="disabled" value="' + url + '"></td></tr><tr><td><form>Method:<br/><div style="margin-left: 30px;">' + feed_method_html + '</div></form></td></tr></table>';

    $("input[name='rest_feed_method']").click(function() {
        applyRestMethodUpdate(id);
    });
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

