<?php
/**
 * GET returns current data and timestamp
 * POST data, timestamp - posts data if timestamp is fresh
 */

$file = 'data.json';
clearstatcache(true, $file);
$time = filemtime($file);
$ftime = gmdate("D, d M Y H:i:s \G\M\T", $time);

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
			clearstatcache(true, $file);
			$time = filemtime($file);
			$ftime = gmdate("D, d M Y H:i:s \G\M\T", $time);
			header("Last-Modified: ${ftime}");
		}
		break;
	default:
		http_response_code(404);
}