var http = require("http");
var sys = require("util");
var fs = require("fs");
var httpProxy = require('http-proxy');

var mysql = require('mysql')
  , DATABASE = 'sayhs23'
  , client = mysql.createClient({
      user: 'sayhs23'
    , password: '9034gustn'
  });


 var apikey = "d4f7c8cf4b043c224a43aee5dbb3528f";


client.query('USE ' + DATABASE);

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
    

      socket.on('addElbems', function(data) {
		//    console.log('addElbem 이벤트 실행');
		//	console.log('addElbem시 서버 측에서 받은 값' +data.name);
			
			client.query('CREATE TABLE ' + data.name + ' (title varchar(300), thumbnailurl varchar(50), url varchar(100), likes int(5));', function(err) {
			 if (err) {
				//    console.log('테이블 생성 에러 발생');
				//	socket.emit('addElbemsed-fail', {result: data.name});
             }else{
				//	console.log('테이블 생성');
					client.query('INSERT INTO elbems SET name=?, likes =0',[data.name], function(err) {
					
					if (err) {
				//		console.log('에러 발생');
					}else{
					//	console.log('인서트 성공');
						socket.emit('addElbemsed', {result: data.name});
					}
			}
		);
			// socket.emit('addElbemsed', {result: data.name});
			 }
          }
      );
	  });
	  /////////////////   mStreet  에서 노래 담기 부분 ////////////////////////////////////////////////////////////////
	  socket.on('addMusicEmit', function(data) {
		//  console.log('addMusicEmit 이벤트 실행');
		//  console.log('addMusicEmit시 서버 측에서 받은 값' + data.name + data.title + data.thumbnailurl + data.playerUrl);

		  client.query('INSERT INTO '+data.name+' SET title=?, thumbnailurl=?, url=?, likes=0',[ data.title, data.thumbnailurl, data.playerUrl], function(err){
			  if(err) {
				 // console.log('노래 인서트 에러 발생');
			  }else{
				//  console.log('노래 인서트 성공');
			//	  console.log('선택 DB는 '+data.name);
				  socket.emit('addMusicEmited');
			  }
		  }
		  );
	  });

	  socket.on('SelectEmit', function(data) {
	//	  console.log('SelectEmit 이벤트 실행');


	  });
/////////////////   mStreet  앨범 목록 불러오는 부분 ////////////////////////////////////////////////////////////////
	  socket.on('getElbemlist', function(data) {
		//    console.log('getElbemlist 이벤트 실행');
			client.query('SELECT * FROM elbems ORDER BY likes DESC;', function(err, results, fields) {
			 if (err) {
			//	    console.log('앨범 찾기 실패');
             }else{

					//var data = JSON.stringify(results);

					console.log(results);
					socket.emit('getElbemlisted', {result: results});
			 }
          }
      );
	  });
/////////////////   mStreet  앨범 목록 불러오는 부분 ////////////////////////////////////////////////////////////////
	  socket.on('getElbemList2', function(data) {
		    console.log('getElbemList2 이벤트 실행');
			client.query('SELECT * FROM elbems ORDER BY likes DESC;', function(err, results, fields) {
			 if (err) {
				//    console.log('앨범 찾기 실패');
             }else{
					//var data = JSON.stringify(results);

					console.log(results);
					socket.emit('getElbemList2', {result: results});
			 }
          }
      );
	  });
/////////////////   elbem 에서 추천 수 구하는 부분 ////////////////////////////////////////////////////////////////
	  socket.on('getLikes', function(data) {
	//	  console.log('getLikes 이벤트 실행');
		  client.query('SELECT likes FROM elbems WHERE name=?',[data.name], function(err, results, fields) {
			  if( err) {
				   console.log('likes 찾기 실패');
			  }else{
				  console.log(results[0].likes);
				  var currentLikes = results[0].likes;
				  socket.emit('getLikesed', { result: currentLikes });
			  }
		  }
		  );
	  });
/////////////////   elbem 에서 노래 수 구하는 부분 ////////////////////////////////////////////////////////////////
	  socket.on('getNumbers', function(data) {
	//	  console.log('getLikes 이벤트 실행');
		  client.query('SELECT count(*) AS num FROM '+data.name, function(err, results, fields) {
			  if( err) {
				   console.log('count not found');
			  }else{
				  console.log('값은'+results[0].num);
				  socket.emit('getNumbersed', { result: results[0].num  });
			  }
		  }
		  );
	  });
/////////////////   elbem 에서 노래 수 구하는 부분 ////////////////////////////////////////////////////////////////
	  socket.on('searchElbems', function(data) {
	//	  console.log('getLikes 이벤트 실행');
		  client.query('SELECT * FROM elbems WHERE name LIKE "%'+data.name+'%"', function(err, results, fields) {
			  if( err) {
				   console.log('searchElbems! not found');
			  }else{
				  console.log(results);
				  socket.emit('searchElbemsed', { result: results});
			  }
		  }
		  );
	  });
/////////////////   elbem 에서 노래 목록 리스트 가져 오는 부분////////////////////////////////////////////////////////////////
	  socket.on('getMusics', function(data) {
		//  console.log('getMusics 이벤트 실행');
		  client.query('SELECT * FROM '+data.name,function(err, results, fields) {
			  if( err) {
				   console.log('Music 찾기 실패');
			  }else{
				  console.log(results);
				  socket.emit('getMusicsed', { result: results });
			  }
		  }
		  );
	  });
/////////////////   elbem 안에서 이 앨범 추천 수 구하는 부분 ////////////////////////////////////////////////////////////////
socket.on('thisLikesEmit', function(data) {
		  client.query('SELECT likes FROM elbems WHERE name=?',[data.name], function(err, results, fields) {
					if (err) {
					//	console.log('에러 발생');
					}else{
					//	console.log('현재 likes 값은'+results[0].likes);
						var currentLikes = results[0].likes;
						currentLikes++;
						//console.log('증가된 likes 값은'+currentLikes);

						client.query('UPDATE elbems SET likes=? WHERE name=?',[currentLikes, data.name], function(err, results, fields) {
							if (err) {
							//	console.log('에러 발생');
							}else{
								//console.log('like 값 바꾸기 성공');
								client.query('SELECT likes FROM elbems WHERE name=?',[data.name], function(err, results, fields) {
								 if (err) {
								//		 console.log('앨범 찾기 실패');
							    }else{
										socket.emit('thisLikesEmited', {result: results[0].likes});
								 }
						     }
					    );
					}
			}
		);

					}
			}
		);
	  });
/////////////////   mStreet  앨범 추천 하는 부분 ////////////////////////////////////////////////////////////////
	  socket.on('likeElbem', function(data) {
		  client.query('SELECT likes FROM elbems WHERE name=?',[data.name], function(err, results, fields) {
					if (err) {
					//	console.log('에러 발생');
					}else{
					//	console.log('현재 likes 값은'+results[0].likes);
						var currentLikes = results[0].likes;
						currentLikes++;
					//	console.log('증가된 likes 값은'+currentLikes);

						client.query('UPDATE elbems SET likes=? WHERE name=?',[currentLikes, data.name], function(err, results, fields) {
							if (err) {
							//	console.log('에러 발생');
							}else{
							//	console.log('like 값 바꾸기 성공');
								client.query('SELECT * FROM elbems  ORDER BY likes DESC;', function(err, results, fields) {
								 if (err) {
							//			 console.log('앨범 찾기 실패');
							    }else{
										socket.emit('getElbemlisted', {result: results});
								 }
						     }
					    );
					}
			}
		);

					}
			}
		);
	  });
//////////////////////////////////////////드라마 실시간 검색 값 요청 시/////////////////////////////////////////
	  socket.on('tvshow', function(data){
		    var query = "broadcast";
			var options = {
				host: 'openapi.naver.com',
				port: 80,
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
				port: 80,
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
				port: 80,
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
				port: 80,
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
				port: 80,
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
				port: 80,
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


