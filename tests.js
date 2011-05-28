#!/usr/local/bin/node
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

var display = false;
var chunksize = parseInt(process.ARGV[2]);
var messages = parseInt(process.ARGV[3]);
if(process.ARGV.length > 4) {
	display = (process.ARGV[4] === "true");
}

function testcpp(buff, type) {
	var rr = "";
	
	var HTTPParser = require("./lib/parser").HTTPParser;
	var parsed = 0;
	
	var i = chunksize;
	while(i--) {
		rr += buff.join("\r\n") + "\r\n\r\n0123456789";
	}
	var payload = new Buffer(rr);
	var tlen = payload.length;
	var parser = new HTTPParser(type);
	
	parser.onMessageComplete = function (info, headers) {
		parsed++;
		if(display) console.log(JSON.stringify({
			info: info,
			headers: headers
		}));
		if(!info.shouldKeepAlive) parser.reinitialize(type);
	};
	
	var then = new Date().getTime();
	process.stderr.write("start: " + then + "\n");
	while(parsed < messages) {
		for(var i=0; i<tlen; i+=chunksize) {
			parser.execute(payload, i, chunksize);
		}
	}
	var now = new Date().getTime();
	process.stderr.write("end: " + now + "\n");
	var elapsed = (now-then)/1000;
	process.stdout.write("c++\t" + chunksize + "\t" + parsed + "\t" + elapsed.toFixed(2) + "\t" + (parsed/elapsed).toFixed(2) + "\n");
	payload = null;
	parser = null;
}

function testnode(buff, type) {
	var rr = "";
	
	var HTTPParser = process.binding("http_parser").HTTPParser;
	var parsed = 0;
	
	var i = chunksize;
	while(i--) {
		rr += buff.join("\r\n") + "\r\n\r\n0123456789";
	}
	var payload = new Buffer(rr);
	var tlen = payload.length;
	var parser = new HTTPParser(type);
	
	parser.onMessageBegin = function () {
		parser.incoming = {"headers": {}};
		parser.field = null;
		parser.value = null;
	};
	
	parser.onHeaderField = function (b, start, len) {
		var slice = b.toString('ascii', start, start+len).toLowerCase();
		if (parser.value != undefined) {
			var dest = parser.incoming.headers;
			if (parser.field in dest) {
				dest[parser.field].push(parser.value);
			} else {
				dest[parser.field] = [parser.value];
			}
			parser.field = null;
			parser.value = null;
		}
		if (parser.field) {
			parser.field += slice;
		} else {
			parser.field = slice;
		}
	};
	
	parser.onHeaderValue = function (b, start, len) {
		var slice = b.toString('ascii', start, start+len);
		if (parser.value) {
			parser.value += slice;
		} else {
			parser.value = slice;
		}
	};
	
	parser.onHeadersComplete = function (info) {
		if (parser.field && (parser.value != undefined)) {
			var dest = parser.incoming.headers;
			if (parser.field in dest) {
				dest[parser.field].push(parser.value);
			} else {
				dest[parser.field] = [parser.value];
			}
			parser.field = null;
			parser.value = null;
		}
		parser.incoming.info = info;
		return false;
	};
	
	parser.onMessageComplete = function () {
		if (parser.field && (parser.value != undefined)) {
			var dest = parser.incoming.headers;
			if (parser.field in dest) {
				dest[parser.field].push(parser.value);
			} else {
				dest[parser.field] = [parser.value];
			}
		}
		parsed++;
		if(display) console.log(JSON.stringify(parser.incoming));
		if(!parser.incoming.info.shouldKeepAlive) parser.reinitialize(type);
		parser.incoming = null;
	};
	
	var then = new Date().getTime();
	process.stderr.write("start: " + then + "\n");
	while(parsed < messages) {
		for(var i=0; i<tlen; i+=chunksize) {
			parser.execute(payload, i, chunksize);
		}
	}
	var now = new Date().getTime();
	process.stderr.write("end: " + now + "\n");
	var elapsed = (now-then)/1000;
	process.stdout.write("node\t" + chunksize + "\t" + parsed + "\t" + elapsed.toFixed(2) + "\t" + (parsed/elapsed).toFixed(2) + "\n");
	payload = null;
	parser = null;
}

testnode(response, "response");
testcpp(response, "response");