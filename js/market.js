const LOAD_FEED_MARKET_PHP = 'php/loadFeedMarket.php';
const LOAD_PROJECT_MARKET_PHP = 'php/loadProjectMarket.php';
const PUBLISH_PROJECT_PHP = 'php/publishProject.php';

const USDL_URL = 'projects/index.php?';
const SUSDL_URL = 'projects/rdf.php?';

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


function publishProject() {
    var name = encodeURIComponent($('#publishProjectName').val());
    var author = encodeURIComponent($('#publishProjectAuthor').val());
    var description = encodeURIComponent($('#publishProjectDescription').val());
    var keywords = encodeURIComponent($('#publishProjectKeywords').val());
    if(name == '') {
        alert('Please enter project name.');
        return;
    }
    if(author == '') {
        alert('Please enter author name.');
        return;
    }
    if(description == '') {
        alert('Please enter description.');
        return;
    }
    if(keywords == '') {
        alert('Please enter keywords.');
        return;
    }

    if(_feeds_nodes.length == 1) {
        alert('Nothing to publish.');
        return;
    }

    var json = encodeURIComponent(getFeedsJSON());
    var md5 = MD5(new Date() + name + author + keywords + json + description);

    name = name.replace(/\'/g, '\\\'');
    author = author.replace(/\'/g, '\\\'');
    keywords = keywords.replace(/\'/g, '\\\'');
    description = description.replace(/\'/g, '\\\'');
    description = description.replace(/\n/g, '<br/>');
    json = json.replace(/\'/g, '\\\'');

    $.ajax({
            url: PUBLISH_PROJECT_PHP + '?md5=' + md5 + '&name=' + name + '&author=' + author + '&keywords=' + keywords + '&description=' + description + '&json=' + json,
            type: REST_METHOD_GET,
            success: function() {
                $('#dashboard_output').html('<div>Project "' + decodeURIComponent(name) + '" is published.</div><div>MD5: ' + md5 + '</div><div class="div_push_button" onclick="invisibleElement(\'dashboard\');invisibleElement(\'dashboard_div\');$(\'#dashboard_output\').html(\'\');">Close</div>');
            }
    });
}

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
        var md5 = item.md5;
        var name = item.name;
        var author = item.author;
        var description = item.description.replace(/\"/g, '"');
        var json = item.json.replace(/\"/g, '"');
        var keywords = item.keywords;
        _project_market_md5s[index] = md5;
        _project_market_names[index] = name.replace(/\\\'/g, "'");
        _project_market_authors[index] = author.replace(/\\\'/g, "'");
        _project_market_descs[index] = description.replace(/\\\'/g, "'");
        _project_market_json[index] = json.replace(/\\\'/g, "'");
        _project_market_keywords[index] = keywords.replace(/\\\'/g, "'");
        html += '<tr><td><div class="feed_panel_item" style="width: 80%;" onclick="showProjectMarketItem(' + index + ');">';
        html += name.replace(/\\\'/g, "'");
        html += '</div></td></tr>';
    }

    html += '</table></div></td><td width="60%" style="display:table;"><output id="market_output"></output></td></tr><tr><td><div class="div_push_button" onclick="invisibleElement(\'serviceBoard\');invisibleElement(\'serviceBoard_div\');">Close</div></td></tr></table>';

    visibleElement('serviceBoard');
    visibleElement('serviceBoard_div');
    $('#serviceBoard_output').html(html);
}

function showProjectMarketItem(index) {
    $('#market_output').html('<div class="scrollable_div" style="height: 250px; width: 430px; white-space:normal; display:block;">UID: ' + _project_market_md5s[index] + '<br/>' 
            + 'Name: ' + _project_market_names[index]  + '<br/>'
            + 'Author: <b>' + _project_market_authors[index]  + '</b><br/>'
            + '<a href="' + USDL_URL + 'uid=' + _project_market_md5s[index] + '&output=usdl" target="_blank">USDL</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="' + SUSDL_URL + 'uid=' + _project_market_md5s[index] + '" target="_blank">Semantic-USDL</a><br/>'
            + '<hr/><br/>' + _project_market_descs[index] + '</div><center><div class="div_long_push_button" onclick="doInsertProject(' + index + ');">Add to HyperMash</div></center>');
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
    $('#market_output').html('<div><b>Keywords: </b>' + _feed_market_keywords[index] + '</div><br/><div class="scrollable_div" style="height: 250px; width: 430px; white-space:normal; display:block;">' + _feed_market_descs[index] + '</div><center><div class="div_long_push_button" onclick="insertFeedIntoHyperMash(\'' + _feed_market_names[index] + '\', \'' + _feed_market_urls[index] + '\', \'' + _feed_market_types[index] + '\', \'' + _feed_market_keywords[index] + '\');">Add to HyperMash</div></center>');
}

