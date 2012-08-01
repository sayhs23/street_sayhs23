var http = require("http");
var sys = require("util");
var fs = require("fs");
var httpProxy = require('http-proxy');


 var apikey = "d4f7c8cf4b043c224a43aee5dbb3528f";


module.exports = function(app) {
  var io = require('socket.io').listen(app);


  io.configure(function(){
    io.set('log level', 2);
    io.set('transports', [
        'websocket'
      , 'flashsocket'
      , 'htmlfile'
      , 'xhr-polling'
      , 'jsonp-polling'
    ]);
  });
 

  var Room = io
    .of('/room')
    .on('connection', function(socket) { 
      var joinedRoom = null;
    

//////////////////////////////////////////드라마 실시간 검색 값 요청 시/////////////////////////////////////////
	  socket.on('tvshow', function(data){
		    var query = "broadcast";
			var options = {
				host: 'openapi.naver.com',
				port: 81,
				path: '/search?key='+apikey+'&query='+query+'&display=2&start=1&target=ranktheme'
			};
		   var body = "";
		   http.get(options, function(response){
		   response.addListener('data', function(chunk){
               sys.debug("response...");
               body += chunk;
           });
          response.addListener('end', function(){
                 sys.debug("end...");
				 socket.emit('tvshowed', {xData: body});  
            });}).on('error', function(e) {console.log("Got error: " + e.message);});
	  });
//////////////////////////////////////////책 실시간 검색 값 요청 시/////////////////////////////////////////
	  socket.on('book', function(data){
		    var query = "book";
			var options = {
				host: 'openapi.naver.com',
				port: 81,
				path: '/search?key='+apikey+'&query='+query+'&display=2&start=1&target=ranktheme'
			};
		   var body = "";
		   http.get(options, function(response){
		   response.addListener('data', function(chunk){
               sys.debug("response...");
               body += chunk;
           });
          response.addListener('end', function(){
                 sys.debug("end...");
				 socket.emit('booked', {xData: body});  
            });}).on('error', function(e) {console.log("Got error: " + e.message);});
	  });
//////////////////////////////////////////드라마 실시간 검색 값 요청 시/////////////////////////////////////////
	  socket.on('drama', function(data){
		    var query = "drama";
			var options = {
				host: 'openapi.naver.com',
				port: 81,
				path: '/search?key='+apikey+'&query='+query+'&display=2&start=1&target=ranktheme'
			};
		   var body = "";
		   http.get(options, function(response){
		   response.addListener('data', function(chunk){
               sys.debug("response...");
               body += chunk;
           });
          response.addListener('end', function(){
                 sys.debug("end...");
				 socket.emit('dramaed', {xData: body});  
            });}).on('error', function(e) {console.log("Got error: " + e.message);});
	  });
//////////////////////////////////////////영화 실시간 검색 값 요청 시/////////////////////////////////////////
	  socket.on('movie', function(data){
		    var query = "movie";
			var options = {
				host: 'openapi.naver.com',
				port: 81,
				path: '/search?key='+apikey+'&query='+query+'&display=2&start=1&target=ranktheme'
			};
		   var body = "";
		   http.get(options, function(response){
		   response.addListener('data', function(chunk){
               sys.debug("response...");
               body += chunk;
           });
          response.addListener('end', function(){
                 sys.debug("end...");
				 socket.emit('movied', {xData: body});  
            });}).on('error', function(e) {console.log("Got error: " + e.message);});
	  });
//////////////////////////////////////////인물 실시간 검색 값 요청 시/////////////////////////////////////////
	  socket.on('man', function(data){
		    var query = "people";
			var options = {
				host: 'openapi.naver.com',
				port: 81,
				path: '/search?key='+apikey+'&query='+query+'&display=2&start=1&target=ranktheme'
			};
		   var body = "";
		   http.get(options, function(response){
		   response.addListener('data', function(chunk){
               sys.debug("response...");
               body += chunk;
           });
          response.addListener('end', function(){
                 sys.debug("end...");
				 socket.emit('maned', {xData: body});  
            });}).on('error', function(e) {console.log("Got error: " + e.message);});
	  });
//////////////////////////////////////////공연 실시간 검색 값 요청 시/////////////////////////////////////////
	  socket.on('perfomance', function(data){
		    var query = "perform";
			var options = {
				host: 'openapi.naver.com',
				port: 81,
				path: '/search?key='+apikey+'&query='+query+'&display=2&start=1&target=ranktheme'
			};
		   var body = "";
		   http.get(options, function(response){
		   response.addListener('data', function(chunk){
               sys.debug("response...");
               body += chunk;
           });
          response.addListener('end', function(){
                 sys.debug("end...");
				 socket.emit('perfomanced', {xData: body});  
            });}).on('error', function(e) {console.log("Got error: " + e.message);});
	  });



      socket.on('leave', function(data) {
      
      })
    });
}


