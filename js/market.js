const LOAD_MARKET_PHP = 'php/loadMarket.php';
var _market_descs = [];
var _market_names = [];
var _market_urls = [];
var _market_types = [];

function loadMarket() {
    var json = $.ajax({
            url: LOAD_MARKET_PHP,
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
        _market_descs[index] = desc;
        _market_names[index] = jsonObj.feeds[index].name;
        _market_urls[index] = jsonObj.feeds[index].url;
        _market_types[index] = jsonObj.feeds[index].type;
        html += '<tr><td><div class="feed_panel_item" style="width: 120%;" onclick="showMarketItem(' + index + ');">';
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


function showMarketItem(index) {
    $('#market_output').html('<div class="scrollable_div" style="height: 250px; width: 430px; white-space:normal; display:block;">' + _market_descs[index] + '</div><center><div class="div_long_push_button" onclick="insertFeedIntoHyperMash(\'' + _market_names[index] + '\', \'' + _market_urls[index] + '\', \'' + _market_types[index] + '\');">Add to HyperMash</div></center>');
}

