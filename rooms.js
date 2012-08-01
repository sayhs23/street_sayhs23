var Chat = require("./chat");
var User = require("./User");
var http = require("http");
var Game = require("./Game");
var Music = require("./Music.js");
var sys = require("util");
var fs = require("fs");
var repo = require("./repository");
var trans = require("./xml2json");

var mysql = require('mysql')
  , DATABASE = 'node_test'
  , TABLE = 'friends_test'
  , client = mysql.createClient({
      user: 'root'
	, host: "10.0.0.1" 
    , password: 'root'
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
      Game.setCnt();
   //   console.log('접속함');
      socket.on('join', function(data) {   // 유저가 접속을 하면 방이름을 챗.js의 방 배열에 추가한다.
        if (Chat.hasRoom(data.roomName)) {
          joinedRoom = data.roomName;
          socket.join(joinedRoom); // socket.io의 join 함수를 이용하여 추가를 시킨다.
        
          var name = data.nickName;

          socket.emit('joined', { // 방 확인 후 조인드 이벤트를 시킨다. 
            isSuccess:true, nickname:name
          });
          socket.broadcast.to(joinedRoom).emit('joined', {
            isSuccess:true, nickname:name
          });
          Chat.joinRoom(joinedRoom, data.nickName);
        } else {
          socket.emit('joined', {isSuccess:false});
        }
      });

/////////////////   sStreet 에서 쇼핑 백 추가하는 부분 ////////////////////////////////////////////////////////

      socket.on('addBags', function(data) {
		    client.query('CREATE TABLE '+data.name + '( id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY, title varchar(300), link varchar(300), image varchar(150), lprice int(20), hprice int(20), mallName varchar(30), likes int(10));', function(err) {
				if(err) {
					console.log('백 테이블 생성 실패');
					socket.emit('addBagsed-fail', {result:data.name});
			    }else{
					console.log('테이블 생성 되고, 받은 값은' + data.name + data.pw);

					client.query('INSERT INTO bag SET name =?, pws=?', [data.name, data.pw], function(err) {

						if(err){
							console.log('인서트 에러');
						}else{
							socket.emit('addBagsed', {result: data.name});
						}
					});
				}
			});
	  });

/////////////////   mStreet  앨범 추가하는 부분 ////////////////////////////////////////////////////////////////

      socket.on('addElbems', function(data) {
		//    console.log('addElbem 이벤트 실행');
		//	console.log('addElbem시 서버 측에서 받은 값' +data.name);
			
			client.query('CREATE TABLE ' + data.name + ' (title varchar(300), thumbnailurl varchar(50), url varchar(100), likes int(5));', function(err) {
			 if (err) {
				//    console.log('테이블 생성 에러 발생');
					socket.emit('addElbemsed-fail', {result: data.name});
             }else{
				//	console.log('테이블 생성');
				    console.log('테이블 생성 되고 , 받은 값은' +data.name + data.pw);
			
					client.query('INSERT INTO elbems SET name=?, likes=0, pws=?',[data.name, data.pw], function(err) {
					
					if (err) {
				 	console.log('인서트가 안된서 addElbems 이벤트임. 에러 발생');
					}else{
					//	console.log('인서트 성공');
						socket.emit('addElbemsed', {result: data.name});
					}
			});
			// socket.emit('addElbemsed', {result: data.name});
			 }
          });
	  });
	  /////////////////   mStreet  에서 노래 담기 부분 ////////////////////////////////////////////////////////////////
	  socket.on('addMusicEmit', function(data) {
		//  console.log('addMusicEmit 이벤트 실행');
		//  console.log('addMusicEmit시 서버 측에서 받은 값' + data.name + data.title + data.thumbnailurl + data.playerUrl);
		  client.query('SELECT pws FROM elbems where name=?',[data.name], function(err, results, fields){
				  if(err){
                      console.log('에러가 발생했어요 ');
				  } else{
					    console.log('여기서 알게된 pws는 '+results);
						console.log('비밀번호는'+results[0].pws);

						var serverpw= results[0].pws;
						if(serverpw==data.pw){
					    client.query('INSERT INTO '+data.name+' SET title=?, thumbnailurl=?, url=?, likes=0',[ data.title, data.thumbnailurl, data.playerUrl], function(err){
								  if(err){
										  console.log('인서트 자체를 실패함 100라인');
								 }else{
									     console.log('인서트를 성공했어요');
										 socket.emit('addMusicEmited');
								 }
						 });
						}else{
							    console.log('비밀번호가 달라요!');
								socket.emit('addMusicEmited-fail');
						}
					    
				   }
			 });
	  });

/////////////////////////////////////////// sStreet 에서 아이템(쇼핑 품목) 담기 부분 ///////////////////////////////////////////

      socket.on('addItem', function(data) {
		  console.log(data.bag+data.title+data.link+data.image+data.lprice+data.hprice+data.mallName);
		  client.query('INSERT INTO '+data.bag+' SET title=?, link=?, image=?, lprice=?, hprice=?, mallName=?, likes=0',[ data.title, data.link, data.image, data.lprice, data.hprice, data.mallName], function(err){
								  var title = data.title;
								  var image = data.image;
								  if(err){
										  console.log('인서트 자체를 실패함 148라인');
								 }else{
									     console.log('인서트를 성공했어요');
										 socket.emit('addItemed',{title:title, image:image});
								 }
				});
	  });

/////////////////////////////////////////// sStreet name, pw 인증 하는 부분/////////////////////////////////////////
	  socket.on('checkBag', function(data) {
		  client.query('SELECT pws FROM bag where name=?',[data.name], function(err, results, fields){
				  if(err){
                      console.log('에러가 발생했어요 ');
				  } else{
					    console.log('여기서 알게된 pws는 '+results);
						console.log('비밀번호는'+results[0].pws);

						var serverpw= results[0].pws;
						console.log('////////////////////////////////'+data.pw);
						if(serverpw==data.pw){
							    var name = data.name;
							    console.log('인서트를 성공했어요');
								socket.emit('checkBaged',{name:name});
			
						}else{
							    console.log('비밀번호가 달라요!');
								socket.emit('checkBag-fail');
						}
					    
				   }
			 });
	  });
	  socket.on('SelectEmit', function(data) {
	//	  console.log('SelectEmit 이벤트 실행');


	  });

/////////////////   sStreet  백 목록 불러오는 부분 ////////////////////////////////////////////////////////////////
	  socket.on('getBaglist', function(data) {
		//    console.log('getElbemlist 이벤트 실행');
			client.query('SELECT * FROM bag;', function(err, results, fields) {
			 if (err) {
			      console.log('백 찾기 실패');
             }else{

					//var data = JSON.stringify(results);

					console.log(results);
					socket.emit('getBaglisted', {result: results});
			 }
          });
	  });
////////////////// 글 가져 오기 ////////////////////////////////////////////////////////////////////////
	  socket.on('getNote', function(data) {
		        var communityName = data.communityName;
				client.query('SELECT * FROM '+communityName+' order by id desc;', function(err, results, fields){
						if(err){
							console.log('샐랙트 에러');
						}else{
						   console.log(results);
						   socket.emit('getNoteed', {result: results});
						}
				});
	  });
////////////////// 글 가져 오기 ////////////////////////////////////////////////////////////////////////
	  socket.on('writeNote', function(data) {
		  console.log(data.writterPw+data.nowTime+data.writter+data.description+data.style+data.writterPw);
		  var communityName = data.communityName;
		  client.query('INSERT INTO '+communityName+' SET writter=?, description=?, date1=?, style=?, pws=?',[ data.writter, data.description, data.nowTime, data.style, data.writterPw], function(err){
								  if(err){
										  console.log('인서트 자체를 실패함 148라인');
								 }else{
									     console.log('인서트를 성공했어요');
										 client.query('SELECT * FROM '+communityName+' order by id desc;', function(err, results, fields){
											 if(err){
												 console.log('샐랙트 에러');
										     }else{
												 console.log(results);
												 socket.emit('writeNoteed', {result: results});
											}
										});
								 }
				});
	  });
////////////////// 정렬해서 가져 오기 ////////////////////////////////////////////////////////////////////////
	  socket.on('getSortNote', function(data) {
		  var communityName = data.communityName;
		  var selectValue = data.selectValue;

		  if(selectValue ==5) {
				client.query('SELECT * FROM '+communityName+' order by id desc;', function(err, results, fields){
						if(err){
							console.log('소트 2번째에서 에러');
						}else{
						   console.log(results);
						   socket.emit('getNoteed', {result: results});
						}
				});
		  }else{
			    client.query('SELECT * FROM '+communityName+' WHERE style=? order by id desc;', [selectValue], function(err, results, fields){
						if(err){
							console.log('소트 2번째에서 에러');
						}else{
						   console.log(results);
						   socket.emit('getNoteed', {result: results});
						}
				});
		  }

	  });
////////////////// 글 삭제하기 오기 ////////////////////////////////////////////////////////////////////////
	  socket.on('deleteNote', function(data) {
		  console.log(data.id+data.pws+data.communityName);
		  var communityName = data.communityName;
		  var id = data.id;
		  var pws = data.pws;
		  client.query('SELECT pws FROM '+data.communityName+' WHERE id='+data.id, function(err, results, fields){				
								  if(err){
										  console.log('에러발생함.');
								 }else{
									     var serverpws = results[0].pws; 
										 console.log('내가 지우고 하는 게시글의 비밀번호는'+serverpws);
										 console.log('클리언트가 입력한 값은'+pws);

										 if(serverpws==pws){
											 client.query('DELETE FROM '+communityName+' WHERE ID='+id, function(err){
												 if(err){
													 console.log('샐랙트 에러');
											     }else{
													 console.log(results);
													 console.log('성공함');
													 socket.emit('deleteNoted');
												}
											});
									     }else{
                                             console.log('비번이다르다');
											 socket.emit('deleteNoted-fail');
										 }
								 }
				});
	  });
///////////////////////////댓글 삭제하기//////////////////////////////////////////////////////////////////////////////////
	  socket.on('deleteComment', function(data) {
		  console.log('댓글 삭제 이벤트'+data.id+data.pws+data.communityName);
		  var communityName = data.communityName;
		  var id = data.id;
		  var pws = data.pws;
		  var number = data.number;

		  console.log('댓글 지우는 이벤트 발생!'+communityName+'id: ->'+ id +'number: ->'+number);

		  client.query('SELECT pws FROM comment WHERE id='+data.id, function(err, results, fields){				
								  if(err){
										  console.log('에러발생함.');
								 }else{
									     var serverpws = results[0].pws; 
										 console.log('내가 지우고 하는 게시글의 비밀번호는'+serverpws);
										 console.log('클리언트가 입력한 값은'+pws);

										 if(serverpws==pws){
											 client.query('DELETE FROM comment WHERE ID='+id, function(err){
												 if(err){
													 console.log('샐랙트 에러');
											     }else{
													 console.log('성공함');
													 socket.emit('deleteCommented',{ number:number, id:id});
												}
											});
									     }else{
                                             console.log('비번이다르다');
											 socket.emit('deleteCommented-fail');
										 }
								 }
				});
	  });
/////////////////////////////// cStreet 서버 코드 ///////////////////////////////////////////////////////////////////////
/////////////////   cStreet 에서 커뮤니티 추가하는 부분 ////////////////////////////////////////////////////////
//client.query('CREATE TABLE ' + data.name + ' (title varchar(300), thumbnailurl varchar(50), url varchar(100), likes int(5));', function(err) {
      socket.on('createCm', function(data) {
		    console.log(data.name + data.pw);
		    client.query('CREATE TABLE '+data.name + '( id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY, writter varchar(300), description varchar(1000), date1 varchar(20),  style int(10), pws varchar(30));', function(err) {
				if(err) {
					console.log('커뮤니티 테이블 생성 실패');
					socket.emit('createCm-fail', {result:data.name});
			    }else{
					console.log('테이블 생성 되고, 받은 값은' + data.name + data.pw);

					client.query('INSERT INTO community SET name =?, pws=?', [data.name, data.pw], function(err) {

						if(err){
							console.log('인서트 에러');
						}else{
							socket.emit('createCmed', {result: data.name});
						}
					});
				}
			});
	  });
////////////////////////////////////////////community 에서 comment 댓글 다는 거 테이블에 저장 할 때 /////////////////////////////////////////////////////
//room.emit('comment', {communityName:communityName, writter:user, pws:userPw, description:commentTxt, number:number, date1:nowTime});

		socket.on('comment', function(data){
			console.log(data.communityName+data.writter+data.pws+data.description+data.number+data.date1);
			var communityName = data.communityName;
			var writter = data.writter;
			var description = data.description;
			var number = data.number; // 이게 해당글의 id 다.
			var date1 = data.date1;

			client.query('INSERT INTO comment SET community =?, writter=?, pws=?, description=?, number=?, date1=?', [data.communityName,data.writter,data.pws,data.description,data.number,data.date1], function(err) {
						if(err){
							console.log('comment 테이블에 댓글 인서트 오류');
						}else{
							client.query('SELECT id FROM comment WHERE community=? and description=? and date1=?', [data.communityName, data.description, data.date1], function(err, results, fields){
								if(err){
									console.log('엘러 발생');
								}else{
									var id = results[0].id;
									socket.emit('commented', { id:id, communityName: communityName, writter:writter, description:description, number:number, date1:date1});
								}
							});
						}
					});
		});

////////////////////////////////////////comment 즉, 댓글을 가져오는 부분이다//////////////////////////////////////////////////////////////////////////////////////

		socket.on('getComment', function(data){
			console.log('갯 커맨트 이벤트 발생');
			client.query('SELECT * FROM comment where community=? order by id desc;', [data.communityName], function(err, results, fields) {
				if(err) {
					console.log('갯 커멘트 쿼리 실패');
				}else{
					console.log(results);
					socket.emit('getCommented', {result: results});
				}
			});
		});
/////////////////   cStreet 에서 커뮤니티 찾는 부분 //////////////////////////////////////////////////////////////// 키이벤트일경우 자동완성을 위해////////
	  socket.on('searchComsClick', function(data) {
	//	  console.log('getLikes 이벤트 실행');
		  client.query('SELECT * FROM community WHERE name=?', [data.name], function(err, results, fields) {
			  if( err) {
				   console.log('searchElbems! not found');
			  }else{
				  console.log(results);
				  socket.emit('searchComsClicked', { result: results});
			  }
		  });
	  });
/////////////////   cStreet 에서 커뮤니티 찾는 부분 //////////////////////////////////////////////////////////////// 마우스 클릭이벤트 일경우/////////////////
	  socket.on('searchComs', function(data) {
	//	  console.log('getLikes 이벤트 실행');
		  client.query('SELECT * FROM community WHERE name LIKE "%'+data.name+'%"', function(err, results, fields) {
			  if( err) {
				   console.log('searchElbems! not found');
			  }else{
				  console.log(results);
				  socket.emit('searchComsed', { result: results});
			  }
		  });
	  });
/////////////////   cStreet 에서 비밀 번호 찾는 부분 //////////////////////////////////////////////////////////////// 마우스 클릭이벤트 일경우/////////////////
	  socket.on('getPw', function(data) {
	//	  console.log('getLikes 이벤트 실행');
		  client.query('SELECT pws FROM community WHERE name=?',[data.name], function(err, results, fields) {
			  if( err) {
				   console.log('getPw! not found');
			  }else{
				  var serverpws = results[0].pws;
				  if(serverpws === data.pw){
					  console.log('커뮤니티 인증 성공');
				      socket.emit('getPwed');
				  }else{
					  console.log('커뮤니티 인증 실패! . 비밀 번호가 다르다');
					  socket.emit('getPwed-fail');
				  }
			  }
		  });
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
          });
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
          });
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
		  });
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
		  });
	  });
/////////////////   elbem 에서 앨범 찾는 부분 ////////////////////////////////////////////////////////////////
	  socket.on('searchElbems', function(data) {
	//	  console.log('getLikes 이벤트 실행');
		  client.query('SELECT * FROM elbems WHERE name LIKE "%'+data.name+'%"', function(err, results, fields) {
			  if( err) {
				   console.log('searchElbems! not found');
			  }else{
				  console.log(results);
				  socket.emit('searchElbemsed', { result: results});
			  }
		  });
	  });
/////////////////   bag  백 추천수 투표 결과 목록 불러오는 부분 ////////////////////////////////////////////////////////////////
	  socket.on('getLikeList', function(data) {
		   console.log('getLikeList 이벤트 실행');
			client.query('SELECT * FROM '+data.bagName+' ORDER BY likes DESC;', function(err, results, fields) {
			 if (err) {
				 console.log('getLikeList 찾기 실패');
             }else{
					//var data = JSON.stringify(results);
					console.log(results);
					socket.emit('getLikeListed', {result: results});
			 }
          });
	  });
/////////////////// 쇼핑에서 장바구니 목록 찾는 부분 ///////////////////////////////////////////////////////////
	  socket.on('searchBags', function(data) {
	//	  console.log('getLikes 이벤트 실행');
		  client.query('SELECT * FROM bag WHERE name LIKE "%'+data.name+'%"', function(err, results, fields) {
			  if( err) {
				   console.log('searchBags! not found');
			  }else{
				  console.log(results);
				  socket.emit('searchBagsed', { result: results});
			  }
		  });
	  });
/////////////////   elbem 에서 담게에서 앨범 찾는 부분 ////////////////////////////////////////////////////////////////
	  socket.on('searchElbems2', function(data) {
	//	  console.log('getLikes 이벤트 실행');
		  client.query('SELECT * FROM elbems WHERE name LIKE "%'+data.name+'%"', function(err, results, fields) {
			  if( err) {
				   console.log('searchElbems! not found');
			  }else{
				  console.log(results);
				  socket.emit('searchElbemsed2', { result: results});
			  }
		  });
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
		  });
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
						     });
					}
			});

					}
			});
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
						     });
							 }
						});
					}
			});
	  });
/////////////////   bag 안에서 해당 아이템 추천하는 부분 ////////////////////////////////////////////////////////////////
socket.on('likeItem', function(data) {
	      console.log('likeItem실행');
		  client.query('SELECT likes FROM '+data.bagName+' WHERE title=?',[data.ItemName], function(err, results, fields) {
					if (err) {
						console.log('에러 발생1');
					}else{
						console.log('현재 likes 값은'+results[0].likes);
						var currentLikes = results[0].likes;
						currentLikes++;
						//console.log('증가된 likes 값은'+currentLikes);

						client.query('UPDATE '+data.bagName+' SET likes=? WHERE title=?',[currentLikes, data.ItemName], function(err, results, fields) {
							if (err) {
								console.log('에러 발생2');
							}else{
								//console.log('like 값 바꾸기 성공');
								client.query('SELECT likes FROM '+data.bagName+' WHERE title=?',[data.ItemName], function(err, results, fields) {
								 if (err) {
									 console.log('에러 발생2');
							    }else{
										socket.emit('likeItemed', {result: results[0].likes});
								 }
						     });
					}
			});

					}
			});
	  });
/////////////////   bag 에서 아이템 목록 리스트 가져 오는 부분////////////////////////////////////////////////////////////////
	  socket.on('getItems', function(data) {
		//  console.log('getMusics 이벤트 실행');
		  client.query('SELECT * FROM '+data.name,function(err, results, fields) {
			  if( err) {
				   console.log('Item 찾기 실패');
			  }else{
				  console.log('----------갯 아이템!----------');
				  console.log(results);
				  socket.emit('getItemsed', { result: results });
			  }
		  });
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
/////////////////////////////////////////////쇼핑 api 를 요청 시 ///////////////////////////////////////////////////
socket.on('shop', function(data){
		    var query = data.spText;
			var startPg = data.startPg;
			var selectValue = data.selectValue;
			console.log("검색 할 쇼핑 키워드는: ->" + query);
			console.log("시작 페이지는: ->" + startPg);
			console.log("소트 종류는: ->:" +selectValue);

			var options = {
				host: 'openapi.naver.com',
				port: 80,
				path: '/search?key='+apikey+'&query='+query+'&display=12&start='+startPg+'&target=shop'+'&sort='+selectValue
			};
		   var body = "";
		   http.get(options, function(response){
		   response.addListener('data', function(chunk){
			   //sys.debug("response...");
               body += chunk;
           });
          response.addListener('end', function(){
                 sys.debug("end...");
				 socket.emit('shopped', {xData: body});  
            });}).on('error', function(e) {console.log("Got error: " + e.message);});
	  });
/////////////////////////////////////////////쇼핑 api 를 요청 시 ///////////////////////////////////////////////////
socket.on('shop2', function(data){
		    var query = data.spText;
			var startPg = data.startPg;
			var selectValue = data.selectValue;
			console.log("검색 할 쇼핑 키워드는: ->" + query);
			console.log("시작 페이지는: ->" + startPg);
			console.log("소트 종류는: ->:" +selectValue);

			var options = {
				host: 'openapi.naver.com',
				port: 80,
				path: '/search?key='+apikey+'&query='+query+'&display=12&start='+startPg+'&target=shop'+'&sort='+selectValue
			};
		   var body = "";
		   http.get(options, function(response){
		   response.addListener('data', function(chunk){
               body += chunk;
           });
          response.addListener('end', function(){
                 sys.debug("end...");
				 socket.emit('shopped2', {xData: body});  
            });}).on('error', function(e) {console.log("Got error: " + e.message);});
	  });
// socket.io를 이용한 채팅 관련 부분 메시지 이벤트//////////////////////////////////////////
      socket.on('message', function(data) {
        if (joinedRoom) {
          socket.broadcast.to(joinedRoom).json.send(data);
        }
		else
			socket.broadcast.json.send(data);
	//		console.log('대기실에서 채팅/내용: '+data);
      });


	  socket.on('end', function(data) {
		 var roomName = data.roomName;
		 socket.emit('ended', {roomName:roomName});
		 socket.broadcast.to(joinedRoom).emit('ended', {roomName:roomName});
	  });

	  /// 게임 시작 하기를 했을 시.

	  socket.on('game', function(data) { ////////////////////////////////////// ready.on
		        
			//	console.log('game 이벤트 발생!');

				Music.setMusic();  // Music.js 는 디비로 부터 음악을 가져오는 역할을 하는 것이다.
                var id = Music.getId();
                var name = Music.getName();
                var hint = Music.getHint();
				var result = data.result;
        //아이디, 이름, 힌트 정보 방에 뿌려 주기.

        if (joinedRoom) {
             socket.emit('gamed', {msId: id, msName: name, msHint: hint, result: result});
             socket.broadcast.to(joinedRoom).emit('gamed', {msId: id, msName: name, msHint: hint, result: result});
        }
      });


// 게임 정부 셋팅 하는 부분 
      socket.on('ready', function(data) { ////////////////////////////////////// ready.on
				Music.setMusic();  // Music.js 는 디비로 부터 음악을 가져오는 역할을 하는 것이다.
             //   console.log('Consol long : DB-> Music(hint, videoId, Name) created!!');
                var id = Music.getId();
                var name = Music.getName();
                var hint = Music.getHint();
                Game.increaseCnt();
                var cnt = Game.getCnt();

                var Name = data.nickName;
                var Score = data.usrScore;   
                var Once = data.oneUserScore;

         //       console.log(' in Room.js < onceUserScore: > '+Once);

        if (joinedRoom) {
                                        // DB에서 빼오는 부분임
        //     console.log('Consol long : readied event in Room!');

			 // 사용자 이름, 현재 맞춘 곡수, 비디오 아이디, 비디오 이름, 힌트, 
             socket.emit('readied', { usName: Name, usScore:Score, msId: id, msName: name, msHint: hint, msCnt: cnt, OneScore: Once   });
             socket.broadcast.to(joinedRoom).emit('readied', {
             usName: Name, usScore:Score, msId: id, msName: name, msHint: hint, msCnt: cnt, OneScore: Once   
          });
          
        }
      });

	  socket.on('friendlist', function(data) {
		//  console.log('이벤트 발생자:' + data.nickNmae);
		//  console.log('친구 목록 요청 이벤트 발생 (서버에서 받음)');
           var name ='';

		    client.query( 'SELECT friend FROM ' + TABLE + ' WHERE nickname = ?' , [data.nickNmae], function(err, results, fields) {
            if (err) {
              throw err;
            }
			 name = results.friend; //친구 객체를 넘겨 준다.
			 console.log(results);

			 socket.emit('friendlisted', { usName: results});
      });
	  });

	  socket.on('s', function(){
	//		console.log('받음');
	  });

      socket.on('leave', function(data) {
        if (joinedRoom) {
          Chat.leaveRoom(joinedRoom, data.nickName); ///제거하고 브로드 캐스팅으로 알려준다.
          socket.broadcast.to(joinedRoom).emit('leaved', {
            nickName:data.nickName });
          socket.leave(joinedRoom)
        }
      })
    });
}


