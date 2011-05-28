#!/usr/local/bin/node

var HTTPParser = require("./lib/parser").HTTPParser;
//var HTTPParser = process.binding("http_parser").HTTPParser;
var parser = new HTTPParser("response");

parser.onPath = function(path) {
	console.log("onPath: " + path);
};

parser.onURL = function(url) {
	console.log("onURL: " + url);
};

parser.onFragment = function(fragment) {
	console.log("onFragment: " + fragment);
};

parser.onQueryString = function(qs) {
	console.log("onQueryString: " + qs);
};

parser.onMessageBegin = function() {
	console.log("onMessageBegin");
};

parser.onHeadersComplete = function(info, headers) {
	console.log("onHeadersComplete");
	console.log(JSON.stringify({
		info: info,
		headers: headers
	}));
};

parser.onMessageComplete = function(info, headers) {
	console.log("onMessageComplete");
	console.log(JSON.stringify({
		info: info,
		headers: headers
	}));
};

parser.onBody = function(chunk) {
	console.log("onBody: " + chunk.length);
}

if(parser.bind) parser.bind();

var response = [];
response.push("HTTP/1.1 200 OK");
response.push("date: Mon, 08 Nov 2010 16:53:22 GMT");
response.push("server: Server");
response.push("set-cookie: skin=noskin; path=/; domain=.amazon.co.uk; expires=Mon, 08-Nov-2010 16:53:22 GMT");
response.push("x-amz-id-1: AAAAA");
response.push("x-amz-id-2: BBBBB=");
response.push("vary: Accept-Encoding,User-Agent");
response.push("connection: Keep-Alive");
response.push("Content-Length: 10");
response.push("content-type: text/html; charset=ISO-8859-1");
response.push("set-cookie: session-id-time=2082758401l; path=/; domain=.amazon.co.uk; expires=Tue Jan 01 00:00:01 2036 GMT");
response.push("set-cookie: session-id=277-1111279-4168403; path=/; domain=.amazon.co.uk; expires=Tue Jan 01 00:00:01 2036 GMT");
var payload = new Buffer(response.join("\r\n") + "\r\n\r\n0123456789");

parser.execute(payload, 0, payload.length);

parser.reinitialize("request");
var request = [];
request.push("GET /hello.txt HTTP/1.1");
request.push("Accept-Encoding: gzip");
payload = new Buffer(request.join("\r\n") + "\r\n\r\n");
parser.execute(payload, 0, payload.length);

