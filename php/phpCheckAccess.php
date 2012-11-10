<?php
echo get_http_response_code($_GET['url']);
function get_http_response_code($url) {
    $headers = get_headers($url);
    return substr($headers[0], 9, 3);
}
?>
