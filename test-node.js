var rss = (process.memoryUsage().rss/(1024*1024)).toFixed(2);
console.log(rss);
var HTTPParser = process.binding("http_parser").HTTPParser;

var response = [];
response.push("HTTP/1.1 200 OK");
response.push("date: Mon, 08 Nov 2010 16:53:22 GMT");
response.push("server: Server");
response.push("set-cookie: skin=noskin; path=/; domain=.amazon.co.uk; expires=Mon, 08-Nov-2010 16:53:22 GMT");
response.push("x-amz-id-1: 0SJVADEP0SBYBMHWZXVW");
response.push("x-amz-id-2: UGxjX5JydLOYDUwQNCS0XCKNbDoyqrDefXg0nDYO1U0=");
response.push("vary: Accept-Encoding,User-Agent");
response.push("connection: close");
response.push("Content-Length: 10");
response.push("content-type: text/html; charset=ISO-8859-1");
response.push("set-cookie: session-id-time=2082758401l; path=/; domain=.amazon.co.uk; expires=Tue Jan 01 00:00:01 2036 GMT");
response.push("set-cookie: session-id=277-1111279-4168403; path=/; domain=.amazon.co.uk; expires=Tue Jan 01 00:00:01 2036 GMT");
var rr = "";

var messages = parseInt(process.ARGV[3]);
var display = false;
if(process.ARGV.length > 4) {
	display = (process.ARGV[4] === "true");
}
while(messages--) {
	rr += response.join("\r\n") + "\r\n\r\n0123456789";
}
var response = new Buffer(rr);

var parser = new HTTPParser("response");

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
	parser.incoming = null;
	parser.reinitialize("response");
};

var chunksize = parseInt(process.ARGV[2]);
var tlen = response.length;
var parsed = 0;
var then = new Date().getTime();
for(var i=0; i<tlen; i+=chunksize) {
	parser.execute(response, i, i+chunksize>tlen?tlen-i:chunksize);
}
var now = new Date().getTime();
var elapsed = (now-then)/1000;
console.log("total: " + parsed + " time: " + elapsed.toFixed(2) + " p/sec: " + (parsed/elapsed).toFixed(2));
response = null;
parser = null;
setInterval(function() {
	var rss = (process.memoryUsage().rss/(1024*1024)).toFixed(2);
	console.log(rss);
}, 1000);
