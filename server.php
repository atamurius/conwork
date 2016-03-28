<?php
/**
 * GET returns current data and timestamp
 * POST data, timestamp - posts data if timestamp is fresh
 */

function lastModified($file) {
	clearstatcache(true, $file);
	$time = filemtime($file);
	return gmdate("D, d M Y H:i:s \G\M\T", $time);
}

$file = 'data.json';
$ftime = lastModified($file);

switch ($_SERVER['REQUEST_METHOD']) {

	case 'GET':
		header('Content-Type: text/json');
		header("Last-Modified: ${ftime}");

		$f = fopen($file,'r');
		fpassthru($f);

		break;

	case 'POST':
		$headers = getallheaders();
		$version = $headers['Last-Modified'];
		if ($version !== $ftime) {
			http_response_code(409);
		}
		else {
			file_put_contents($file, $_POST['nodes']);
			$ftime = lastModified($file);
			header("Last-Modified: ${ftime}");
		}
		break;

	default:
		http_response_code(404);
}