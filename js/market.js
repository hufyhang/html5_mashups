const LOAD_FEED_MARKET_PHP = 'php/loadFeedMarket.php';
const LOAD_PROJECT_MARKET_PHP = 'php/loadProjectMarket.php';

var _feed_market_descs = [];
var _feed_market_names = [];
var _feed_market_urls = [];
var _feed_market_types = [];
var _feed_market_keywords = [];

var _project_market_md5s = [];
var _project_market_names = [];
var _project_market_authors = [];
var _project_market_descs = [];
var _project_market_json = [];
var _project_market_keywords = [];


function loadProjectMarket() {
    var json = $.ajax({
            url: LOAD_PROJECT_MARKET_PHP,
            type: REST_METHOD_GET,
            async: false
    }).responseText;
    var jsonObj = (eval('(' + json + ')'));
    var key, count = 0;
    for(key in jsonObj.projects) {
        count++;
    }

    var html = '<div style="padding-left:5px; font-weight:bold;">Project Market</div><table class="frame_table" width="100%"><tr><td width="40%"><div style="height:300px;" class="scrollable_div"><table style="width: 100%;">';
    for(var index = 0; index != count; ++index) {
        var item = jsonObj.projects[index];
        _project_market_md5s[index] = item.md5;
        _project_market_names[index] = item.name;
        _project_market_authors[index] = item.author;
        _project_market_descs[index] = item.description.replace('\"', '"');
        _project_market_json[index] = item.json.replace('\"', '"');
        _project_market_keywords[index] = item.keywords;
        html += '<tr><td><div class="feed_panel_item" style="width: 80%;" onclick="showProjectMarketItem(' + index + ');">';
        html += item.name;
        html += '</div></td></tr>';
    }

    html += '</table></div></td><td width="60%" style="display:table;"><output id="market_output"></output></td></tr><tr><td><div class="div_push_button" onclick="invisibleElement(\'serviceBoard\');invisibleElement(\'serviceBoard_div\');">Close</div></td></tr></table>';

    visibleElement('serviceBoard');
    visibleElement('serviceBoard_div');
    $('#serviceBoard_output').html(html);
}

function showProjectMarketItem(index) {
    $('#market_output').html('<div class="scrollable_div" style="height: 250px; width: 430px; white-space:normal; display:block;">Author: <b>' + _project_market_authors[index]  + '</b><br/><hr/><br/>' + _project_market_descs[index] + '</div><center><div class="div_long_push_button" onclick="doInsertProject(' + index + ');">Add to HyperMash</div></center>');
}

function doInsertProject(index) {
    insertProjectIntoHyperMash(_project_market_md5s[index], _project_market_names[index], _project_market_json[index], _project_market_keywords[index]);
}

function loadFeedMarket() {
    var json = $.ajax({
            url: LOAD_FEED_MARKET_PHP,
            type: REST_METHOD_GET,
            async: false
    }).responseText;
    var jsonObj = (eval('(' + json + ')'));
    var key, count = 0;
    for(key in jsonObj.feeds) {
        count++;
    }
    var html = '<div style="padding-left:5px; font-weight:bold;">Feed Market</div><table class="frame_table" width="100%"><tr><td width="40%"><div style="height:300px;" class="scrollable_div"><table>';
    for(var index = 0; index != count; ++index) {
        var md5 = jsonObj.feeds[index].md5;
        var desc = jsonObj.feeds[index].desc;
        _feed_market_descs[index] = desc;
        _feed_market_names[index] = jsonObj.feeds[index].name;
        _feed_market_urls[index] = jsonObj.feeds[index].url;
        _feed_market_types[index] = jsonObj.feeds[index].type;
        _feed_market_keywords[index] = jsonObj.feeds[index].keywords;
        html += '<tr><td><div class="feed_panel_item" style="width: 120%;" onclick="showFeedMarketItem(' + index + ');">';
        var typeTag = jsonObj.feeds[index].type.toUpperCase();
        html += '<span style="font-weight:bold; color:black;">' + typeTag + '</span>&nbsp;&nbsp;';
        html += jsonObj.feeds[index].name;
        html += '</div></td></tr>';
    }


    html += '</table></div></td><td width="60%" style="display:table;"><output id="market_output"></output></td></tr><tr><td><div class="div_push_button" onclick="invisibleElement(\'serviceBoard\');invisibleElement(\'serviceBoard_div\');">Close</div></td></tr></table>';

    visibleElement('serviceBoard');
    visibleElement('serviceBoard_div');
    $('#serviceBoard_output').html(html);
}


function showFeedMarketItem(index) {
    $('#market_output').html('<div class="scrollable_div" style="height: 250px; width: 430px; white-space:normal; display:block;">' + _feed_market_descs[index] + '</div><center><div class="div_long_push_button" onclick="insertFeedIntoHyperMash(\'' + _feed_market_names[index] + '\', \'' + _feed_market_urls[index] + '\', \'' + _feed_market_types[index] + '\', \'' + _feed_market_keywords[index] + '\');">Add to HyperMash</div></center>');
}

