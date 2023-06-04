<?php

$url = isset($_GET['url']) ? $_GET['url'] : null;

if (!$url || substr($url, 0, 4) != 'http') {
    die('Please, inform URL');
}

if(filter_var($url, FILTER_VALIDATE_URL) === FALSE) {
   die('Invalid URL');
}

readfile( $url );
