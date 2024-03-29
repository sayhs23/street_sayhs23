// JavaScript source code
var Chat = require("./chat");
var http = require("http");
var sys = require("util");
var fs = require("fs");
var repo = require("./repository");

var mysql = require('mysql')
  , DATABASE = 'sayhs23'
  , client = mysql.createClient({
      user: 'sayhs23'
    , host: '10.0.0.1'
    , password: '9034gustn'
  });

var apikey = "d4f7c8cf4b043c224a43aee5dbb3528f";


client.query('USE ' + DATABASE);

module.exports = function(app) {
    var io = require('socket.io').listen(app);


    io.configure(function(){
        io.set('log level', 1);
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
        //  console.log('클라이언트 접속함');
      
        socket.on('join', function(data) {
            if (Chat.hasRoom(data.roomName)) {
                joinedRoom = data.roomName;
                socket.join(joinedRoom);
        
                var name = data.nickName;

                socket.emit('joined', {
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
        //////////////////// 캔버스 모두 지우기////////////////////////
        socket.on('canvasClear', function(data) {
            //console.log('canvasClear 이벤트 실행');
            socket.emit('canvasCleared');
            socket.broadcast.to(joinedRoom).emit('canvasCleared');
        });
        ////////////////// 캔버스 그리기 이벤트 실행
        socket.on('draw', function(data) {
            //  console.log('draw 이벤트 실행'+data.width + data.color + data.x1 + data.y1 + data.x2 + data.y2);
            socket.emit('line', { width: data.width, color:data.color, x1:data.x1, y1:data.y1, x2:data.x2, y2: data.y2} );
            socket.broadcast.to(joinedRoom).emit('line', { width: data.width, color:data.color, x1:data.x1, y1:data.y1, x2:data.x2, y2: data.y2 });
        });

        //////////////////////////////////////// 대기실에 부분에 입장 했을 때 의 서버 코드//////////////////////////////////////////////
        socket.on('waitRoomjoin', function(data) {   // 유저가 접속을 하면 방이름을 챗.js의 방 배열에 추가한다.
            //console.log('room.js 에서 waitRoomjoin 이벤트');
            // socket.io의 join 함수를 이용하여 추가를 시킨다.
        
            var name = data.myName;
            //  console.log(Chat.hasRoom(data.roomName));                             // 대기실
            if(!Chat.hasRoom(data.roomName)){
                Chat.addRoom(data.roomName,'','','','','','');
            }
            if(Chat.hasRoom(data.roomName)) {
			 
                var joinedRoom = data.roomName;
                socket.join(joinedRoom);

                Chat.joinRoom(joinedRoom, data.myName);
                var attendantss = Chat.getAttendantsList(joinedRoom);
                //   console.log(attendantss);
            //    console.log('대기실에서 갯 룸 리스트함수 호출시'+Chat.getRoomList());
                socket.emit('waitRoomjoined', { isSuccess:true, nickname:name, attendants:Chat.getAttendantsList(joinedRoom), roomList:Chat.getRoomList()});
                socket.broadcast.to(joinedRoom).emit('waitRoomjoined', {
                    isSuccess:true, nickname:name, attendants:Chat.getAttendantsList(joinedRoom), roomList:Chat.getRoomList()});
            } else {
                socket.emit('waitRoomjoined', {isSucess:false});
            }
		  
        });
        /////////////////////////////////방을 만들었을 경우///////////////////////////////////////////////////////////////////////////
        socket.on('getRoomList', function() {
         //   console.log('getRoomList 이벤트 발생');
            // 여기서 방인원이 0명이면 없애준다.
         //   console.log(Chat.getRoomList());
            socket.emit('getRoomListed', { roomList: Chat.getRoomList() });
        });
        socket.on('createRoom', function(data) {
            //	 console.log('createRoom 이벤트 발생!');
            var myName = data.myName;
            var roomname = data.roomname;
            console.log('방이름은 ' + roomname);
            var textMax = data.textMax;
            var userMax = data.userMax;
            var roomPublish = data.roomPublish;
            var roompw = data.roompw;
            //	 console.log(textMax, userMax);

            //	 console.log(' 방장이름은 ' + myName);
            //	 console.log(roomPublish + roompw);
            if (!Chat.hasRoom(roomname)) {
                if(roomPublish===true) { //공개 모드일때
                    //	 console.log('공개 모드일때');
                    Chat.addRoom(roomname, textMax, userMax, myName, roomPublish,'',0,0,'' );  // 방만들면 방이름(방명), 최대 게임 판수, 최대 제한 유저수, 방장이나온다.
                }
                else if(roomPublish ===false ) { // 비공개 모드
                    //	   console.log('비공개 모드일때');
                    Chat.addRoom(roomname, textMax, userMax, myName, roomPublish, roompw,0,0,'' );  
                }
                socket.emit('createRoomed', {roomname:roomname}); 
            }else{
                socket.emit('createRoomed-fail'); 
            }
        });

        /////////////////   sStreet 에서 쇼핑 백 추가하는 부분 ////////////////////////////////////////////////////////

        socket.on('addBags', function(data) {
            client.query('CREATE TABLE '+data.name + '( id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY, title varchar(300), link varchar(300), image varchar(150), lprice int(20), hprice int(20), mallName varchar(30), likes int(10));', function(err) {
                if(err) {
                    //	console.log('백 테이블 생성 실패');
                    socket.emit('addBagsed-fail', {result:data.name});
                }else{
                    console.log('테이블 생성 되고, 받은 값은' + data.name + data.pw);

                    client.query('INSERT INTO bag SET name =?, pws=?', [data.name, data.pw], function(err) {

                        if(err){
                            //		console.log('인서트 에러');
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
                    //    console.log('테이블 생성 되고 , 받은 값은' +data.name + data.pw);
			
                    client.query('INSERT INTO elbems SET name=?, likes=0, pws=?',[data.name, data.pw], function(err) {
					
                        if (err) {
                            // 	console.log('인서트가 안된서 addElbems 이벤트임. 에러 발생');
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
                    //    console.log('에러가 발생했어요 ');
                } else{
                    //    console.log('여기서 알게된 pws는 '+results);
                    //	console.log('비밀번호는'+results[0].pws);

                    var serverpw= results[0].pws;
                    if(serverpw==data.pw){
                        client.query('INSERT INTO '+data.name+' SET title=?, thumbnailurl=?, url=?, likes=0',[ data.title, data.thumbnailurl, data.playerUrl], function(err){
                            if(err){
                                //	  console.log('인서트 자체를 실패함 100라인');
                            }else{
                                //    console.log('인서트를 성공했어요');
                                socket.emit('addMusicEmited');
                            }
                        });
                    }else{
                        //  console.log('비밀번호가 달라요!');
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
                    //	  console.log('인서트 자체를 실패함 148라인');
                }else{
                    //     console.log('인서트를 성공했어요');
                    socket.emit('addItemed',{title:title, image:image});
					client.end();
                }
            });
        });

        /////////////////////////////////////////// sStreet name, pw 인증 하는 부분/////////////////////////////////////////
        socket.on('checkBag', function(data) {
            client.query('SELECT pws FROM bag where name=?',[data.name], function(err, results, fields){
                if(err){
                    //   console.log('에러가 발생했어요 ');
                } else{
                    //    console.log('여기서 알게된 pws는 '+results);
                    //	console.log('비밀번호는'+results[0].pws);

                    var serverpw= results[0].pws;
                    //	console.log('////////////////////////////////'+data.pw);
                    if(serverpw==data.pw){
                        var name = data.name;
                        //    console.log('인서트를 성공했어요');
                        socket.emit('checkBaged',{name:name});
						client.end();
			
                    }else{
                        //    console.log('비밀번호가 달라요!');
                        socket.emit('checkBag-fail');
						client.end();
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

                    //	console.log(results);
                    socket.emit('getBaglisted', {result: results});
					client.end();
                }
            });
        });
        ////////////////// 글 가져 오기 ////////////////////////////////////////////////////////////////////////
        socket.on('getNote', function(data) {
            var communityName = data.communityName;
            client.query('SELECT * FROM '+communityName+' order by id desc;', function(err, results, fields){
                if(err){
                    //	console.log('샐랙트 에러');
                }else{
                    //   console.log(results);
                    socket.emit('getNoteed', {result: results});
					client.end();
                }
            });
        });
        ////////////////// 글 가져 오기 ////////////////////////////////////////////////////////////////////////
        socket.on('writeNote', function(data) {
            console.log(data.writterPw+data.nowTime+data.writter+data.description+data.style+data.writterPw);
            var communityName = data.communityName;
            client.query('INSERT INTO '+communityName+' SET writter=?, description=?, date1=?, style=?, pws=?',[ data.writter, data.description, data.nowTime, data.style, data.writterPw], function(err){
                if(err){
                    //	  console.log('인서트 자체를 실패함 148라인');
                }else{
                    //    console.log('인서트를 성공했어요');
                    client.query('SELECT * FROM '+communityName+' order by id desc;', function(err, results, fields){

                        if(err){
                            //	 console.log('샐랙트 에러');
                        }else{
                            //	 console.log(results);
                            socket.emit('writeNoteed', {result: results});
							client.end();
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
                        //	console.log('소트 2번째에서 에러');
                    }else{
                        //   console.log(results);
                        socket.emit('getNoteed', {result: results});
						client.end();
                    }
                });
            }else{
                client.query('SELECT * FROM '+communityName+' WHERE style=? order by id desc;', [selectValue], function(err, results, fields){
                    if(err){
                        //	console.log('소트 2번째에서 에러');
                    }else{
                        //	   console.log(results);
                        socket.emit('getNoteed', {result: results});
						client.end();
                    }
                });
            }

        });
        ////////////////// 글 삭제하기 오기 ////////////////////////////////////////////////////////////////////////
        socket.on('deleteNote', function(data) {
            //  console.log(data.id+data.pws+data.communityName);
            var communityName = data.communityName;
            var id = data.id;
            var pws = data.pws;
            client.query('SELECT pws FROM '+data.communityName+' WHERE id='+data.id, function(err, results, fields){				
                if(err){
                    //	  console.log('에러발생함.');
                }else{
                    var serverpws = results[0].pws; 
                    //	 console.log('내가 지우고 하는 게시글의 비밀번호는'+serverpws);
                    //	 console.log('클리언트가 입력한 값은'+pws);

                    if(serverpws==pws){
                        client.query('DELETE FROM '+communityName+' WHERE ID='+id, function(err){
                            if(err){
                                //		 console.log('샐랙트 에러');
                            }else{
                                //		 console.log(results);
                                //		 console.log('성공함');
                                socket.emit('deleteNoted');
								client.end();
                            }
                        });
                    }else{
                        //       console.log('비번이다르다');
                        socket.emit('deleteNoted-fail');
						client.end();
                    }
                }
            });
        });
        ///////////////////////////댓글 삭제하기//////////////////////////////////////////////////////////////////////////////////
        socket.on('deleteComment', function(data) {
            //  console.log('댓글 삭제 이벤트'+data.id+data.pws+data.communityName);
            var communityName = data.communityName;
            var id = data.id;
            var pws = data.pws;
            var number = data.number;

            console.log('댓글 지우는 이벤트 발생!'+communityName+'id: ->'+ id +'number: ->'+number);

            client.query('SELECT pws FROM comment WHERE id='+data.id, function(err, results, fields){				
                if(err){
                    //	  console.log('에러발생함.');
                }else{
                    var serverpws = results[0].pws; 
                    //	 console.log('내가 지우고 하는 게시글의 비밀번호는'+serverpws);
                    //	 console.log('클리언트가 입력한 값은'+pws);

                    if(serverpws==pws){
                        client.query('DELETE FROM comment WHERE ID='+id, function(err){
                            if(err){
                                //	 console.log('샐랙트 에러');
                            }else{
                                //	 console.log('성공함');
                                socket.emit('deleteCommented',{ number:number, id:id});
								client.end();
                            }
                        });
                    }else{
                        //  console.log('비번이다르다');
                        socket.emit('deleteCommented-fail');
						client.end();
                    }
                }
            });
        });
        /////////////////////////////// cStreet 서버 코드 ///////////////////////////////////////////////////////////////////////
        /////////////////   cStreet 에서 커뮤니티 추가하는 부분 ////////////////////////////////////////////////////////
        //client.query('CREATE TABLE ' + data.name + ' (title varchar(300), thumbnailurl varchar(50), url varchar(100), likes int(5));', function(err) {
        socket.on('createCm', function(data) {
            //  console.log(data.name + data.pw);
            client.query('CREATE TABLE '+data.name + '( id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY, writter varchar(300), description varchar(1000), date1 varchar(20),  style int(10), pws varchar(30));', function(err) {
                if(err) {
                    //console.log('커뮤니티 테이블 생성 실패');
                    socket.emit('createCm-fail', {result:data.name});
                }else{
                    //	console.log('테이블 생성 되고, 받은 값은' + data.name + data.pw);

                    client.query('INSERT INTO community SET name =?, pws=?', [data.name, data.pw], function(err) {

                        if(err){
                            //	console.log('인서트 에러');
                        }else{
                            socket.emit('createCmed', {result: data.name});
							client.end();
                        }
                    });
                }
            });
        });
        ////////////////////////////////////////////community 에서 comment 댓글 다는 거 테이블에 저장 할 때 /////////////////////////////////////////////////////
        //room.emit('comment', {communityName:communityName, writter:user, pws:userPw, description:commentTxt, number:number, date1:nowTime});

        socket.on('comment', function(data){
            //	console.log(data.communityName+data.writter+data.pws+data.description+data.number+data.date1);
            var communityName = data.communityName;
            var writter = data.writter;
            var description = data.description;
            var number = data.number; // 이게 해당글의 id 다.
            var date1 = data.date1;

            client.query('INSERT INTO comment SET community =?, writter=?, pws=?, description=?, number=?, date1=?', [data.communityName,data.writter,data.pws,data.description,data.number,data.date1], function(err) {
                if(err){
                    //	console.log('comment 테이블에 댓글 인서트 오류');
                }else{
                    client.query('SELECT id FROM comment WHERE community=? and description=? and date1=?', [data.communityName, data.description, data.date1], function(err, results, fields){
                        if(err){
                            //	console.log('엘러 발생');
                        }else{
                            var id = results[0].id;
                            socket.emit('commented', { id:id, communityName: communityName, writter:writter, description:description, number:number, date1:date1});
							client.end();
						}
                    });
                }
            });
        });
        //////////////////////////로그인 하는 부분////////////////////////gStreet////////////////////////////////////////////
        socket.on('login', function(data) {
            var nickName = data.nickName;
            var pws = data.pws;

            client.query('SELECT pws FROM members WHERE nickname=?', [nickName], function(err, results, fields){
                if(err){
                    //	console.log('로그인 오류.');
                }else{
                    try{
                        var serverpws = results[0].pws;
                    }catch(e){
                        socket.emit('logined-fail');
                    }
							
                    if(serverpws == pws) {
                        client.query('SELECT * FROM members WHERE nickname=?', [nickName], function(err, results, fields){
                            if(err){
                                //	console.log('재 결과 탐색시 에러. 발생');
                            }else{
                                var nickName = results[0].nickname;
                                var level = results[0].level;
                                var totalscore = results[0].totalscore;

                                socket.emit('logined', { nickName:nickName, level: level, totalscore:totalscore});
                            }
                        });
                    }else{
                        socket.emit('logined-fail');

                    }
                }
            });
        });
        socket.on('getUserInfo', function(data) {
            //   console.log('getUserInfo에 진입함');
            var nickname = data.nickname;
            console.log(nickname);
            var attendants = Chat.getAttendantsList(data.roomname);

            client.query('SELECT * FROM members WHERE nickname=?', [nickname], function(err, results, fields){
                if(err){
                    //	console.log('재 결과 탐색시 에러. 발생');
                }else{
                    var nickName = results[0].nickname;
                    var level = results[0].level;
                    var totalscore = results[0].totalscore;

                    console.log('getUserInfo에서 사용자 리스트는 '+attendants)

                    socket.emit('getUserInfoed', { nickName:nickName, level: level, totalscore:totalscore,attendants:attendants});
                }
            });
        });

        ///////////////////////회원 가입//////////////////////////////////////gStreet///////////////////////////////////
        socket.on('memberJoin', function(data){
            var level = '입문';
            //	console.log('회원 가입 이벤트에 들어옴//// 회원 가입 렌더링');
            client.query('INSERT INTO members SET nickname =?, pws=?, level=?, totalscore=0', [data.nickName,data.pws,level], function(err) {
                if(err){
                    //		console.log('회원가입 오류 - 이미 있는 아이디 nickname -> primary key!');
                    socket.emit('memberJoined-fail');
                }else{
                    //	console.log('회원 가입 성공');
                    client.query('SELECT * FROM members where nickname=?', [data.nickName], function(err, results, fields) {
                        if(err) {
                            //	console.log('갯 커멘트 쿼리 실패');
                        }else{
                            var nickName = results[0].nickname;
                            var level = results[0].level;
                            var totalscore = results[0].totalscore;

                            //	console.log(results);
                            //	console.log(nickName + level + totalscore);
                            socket.emit('memberJoined', {nickName:nickName, level:level, totalscore:totalscore });
                        }
                    });
                }
            });
        });
        ////////////////////////////////////////comment 즉, 댓글을 가져오는 부분이다//////////////////////////////////////////////////////////////////////////////////////

        socket.on('getComment', function(data){
            //	console.log('갯 커맨트 이벤트 발생');
            client.query('SELECT * FROM comment where community=? order by id desc;', [data.communityName], function(err, results, fields) {
                if(err) {
                    //	console.log('갯 커멘트 쿼리 실패');
                }else{
                    //	console.log(results);
                    socket.emit('getCommented', {result: results});
                }
            });
        });
        /////////////////   cStreet 에서 커뮤니티 찾는 부분 //////////////////////////////////////////////////////////////// 키이벤트일경우 자동완성을 위해////////
        socket.on('searchComsClick', function(data) {
            //	  console.log('getLikes 이벤트 실행');
            client.query('SELECT * FROM community WHERE name=?', [data.name], function(err, results, fields) {
                if( err) {
                    //   console.log('searchElbems! not found');
                }else{
                    //  console.log(results);
                    socket.emit('searchComsClicked', { result: results});
                }
            });
        });
        /////////////////   cStreet 에서 커뮤니티 찾는 부분 //////////////////////////////////////////////////////////////// 마우스 클릭이벤트 일경우/////////////////
        socket.on('searchComs', function(data) {
            //	  console.log('getLikes 이벤트 실행');
            client.query('SELECT * FROM community WHERE name LIKE "%'+data.name+'%"', function(err, results, fields) {
                if( err) {
                    //	   console.log('searchElbems! not found');
                }else{
                    //  console.log(results);
                    socket.emit('searchComsed', { result: results});
                }
            });
        });
        /////////////////   cStreet 에서 비밀 번호 찾는 부분 //////////////////////////////////////////////////////////////// 마우스 클릭이벤트 일경우/////////////////
        socket.on('getPw', function(data) {
            //	  console.log('getLikes 이벤트 실행');
            client.query('SELECT pws FROM community WHERE name=?',[data.name], function(err, results, fields) {
                if( err) {
                    //   console.log('getPw! not found');
                }else{
                    var serverpws = results[0].pws;
                    if(serverpws === data.pw){
                        //	  console.log('커뮤니티 인증 성공');
                        socket.emit('getPwed');
                    }else{
                        //	  console.log('커뮤니티 인증 실패! . 비밀 번호가 다르다');
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

                    //	console.log(results);
                    socket.emit('getElbemlisted', {result: results});
                }
            });
        });
        /////////////////   mStreet  앨범 목록 불러오는 부분 ////////////////////////////////////////////////////////////////
        socket.on('getElbemList2', function(data) {
            //    console.log('getElbemList2 이벤트 실행');
            client.query('SELECT * FROM elbems ORDER BY likes DESC;', function(err, results, fields) {
                if (err) {
                    //    console.log('앨범 찾기 실패');
                }else{
                    //var data = JSON.stringify(results);

                    //	console.log(results);
                    socket.emit('getElbemList2', {result: results});
                }
            });
        });
        /////////////////   elbem 에서 추천 수 구하는 부분 ////////////////////////////////////////////////////////////////
        socket.on('getLikes', function(data) {
            //	  console.log('getLikes 이벤트 실행');
            client.query('SELECT likes FROM elbems WHERE name=?',[data.name], function(err, results, fields) {
                if( err) {
                    //	   console.log('likes 찾기 실패');
                }else{
                    //	  console.log(results[0].likes);
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
                    //	   console.log('count not found');
                }else{
                    //	  console.log('값은'+results[0].num);
                    socket.emit('getNumbersed', { result: results[0].num  });
                }
            });
        });
        /////////////////   elbem 에서 앨범 찾는 부분 ////////////////////////////////////////////////////////////////
        socket.on('searchElbems', function(data) {
            //	  console.log('getLikes 이벤트 실행');
            client.query('SELECT * FROM elbems WHERE name LIKE "%'+data.name+'%"', function(err, results, fields) {
                if( err) {
                    //   console.log('searchElbems! not found');
                }else{
                    //  console.log(results);
                    socket.emit('searchElbemsed', { result: results});
                }
            });
        });
        /////////////////   bag  백 추천수 투표 결과 목록 불러오는 부분 ////////////////////////////////////////////////////////////////
        socket.on('getLikeList', function(data) {
            //  console.log('getLikeList 이벤트 실행');
            client.query('SELECT * FROM '+data.bagName+' ORDER BY likes DESC;', function(err, results, fields) {
                if (err) {
                    // console.log('getLikeList 찾기 실패');
                }else{
                    //var data = JSON.stringify(results);
                    //	console.log(results);
                    socket.emit('getLikeListed', {result: results});
                }
            });
        });
        /////////////////// 쇼핑에서 장바구니 목록 찾는 부분 ///////////////////////////////////////////////////////////
        socket.on('searchBags', function(data) {
            //	  console.log('getLikes 이벤트 실행');
            client.query('SELECT * FROM bag WHERE name LIKE "%'+data.name+'%"', function(err, results, fields) {
                if( err) {
                    //   console.log('searchBags! not found');
                }else{
                    //	  console.log(results);
                    socket.emit('searchBagsed', { result: results});
                }
            });
        });
        /////////////////   elbem 에서 담게에서 앨범 찾는 부분 ////////////////////////////////////////////////////////////////
        socket.on('searchElbems2', function(data) {
            //	  console.log('getLikes 이벤트 실행');
            client.query('SELECT * FROM elbems WHERE name LIKE "%'+data.name+'%"', function(err, results, fields) {
                if( err) {
                    //   console.log('searchElbems! not found');
                }else{
                    //	  console.log(results);
                    socket.emit('searchElbemsed2', { result: results});
                }
            });
        });
        /////////////////   elbem 에서 노래 목록 리스트 가져 오는 부분////////////////////////////////////////////////////////////////
        socket.on('getMusics', function(data) {
            //  console.log('getMusics 이벤트 실행');
            client.query('SELECT * FROM '+data.name,function(err, results, fields) {
                if( err) {
                    //   console.log('Music 찾기 실패');
                }else{
                    //	  console.log(results);
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
                    //	console.log('에러 발생1');
                }else{
                    //	console.log('현재 likes 값은'+results[0].likes);
                    var currentLikes = results[0].likes;
                    currentLikes++;
                    //console.log('증가된 likes 값은'+currentLikes);

                    client.query('UPDATE '+data.bagName+' SET likes=? WHERE title=?',[currentLikes, data.ItemName], function(err, results, fields) {
                        if (err) {
                            //	console.log('에러 발생2');
                        }else{
                            //console.log('like 값 바꾸기 성공');
                            client.query('SELECT likes FROM '+data.bagName+' WHERE title=?',[data.ItemName], function(err, results, fields) {
                                if (err) {
                                    //	 console.log('에러 발생2');
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
                    //   console.log('Item 찾기 실패');
                }else{
                    //  console.log('----------갯 아이템!----------');
                    //  console.log(results);
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
                console.log('해당 방이름은'+joinedRoom);
            }
            else
                socket.broadcast.json.send(data);
            console.log('채팅 내용은:'+data.nickName+'->'+data.msg);
            //		console.log('대기실에서 채팅/내용: '+data);
        });


        socket.on('end', function(data) {
            var roomName = data.roomName;
            socket.emit('ended', {roomName:roomName});
            socket.broadcast.to(joinedRoom).emit('ended', {roomName:roomName});
        });
        ////////////현재방유저리스트 불러오는 부분/////////////////////////
        socket.on('getRoomUserList', function(data) {
            var roomname = data.roomname;
            var room = Chat.getRoomInfo(roomname);
            var userList = room.attendants;

       //     console.log('getRoomUserList 이벤트 호출 '+ userList);

            socket.emit('getRoomUserListed', {attendants:userList});
        });

        socket.on('getUserCnt', function(data){
            var roomname = data.roomname;
            var room = Chat.getRoomInfo(roomname);
            var userList = room.attendants;

        //    console.log('해당 방의 유저의 수는'+ room.attendants.length);
            //현재 방에 있는 사람들의 수를 센다.
            socket.emit('getUserCnted', {UserCnt:room.attendants.length});

 
        });

        /// drawwer 가 아니 어느 사람이 정답을 맞췄을 때.
        socket.on('increaseScore', function(data) {
            console.log('increaseScore 함수 호출');
            var nickname = data.nickname; // 정답 맞춘 사람 아이디
            var roomname = data.roomname; // 정답 맞춘 사람이 있던 방.
            var room = Chat.getRoomInfo(roomname); //일단 맞춘 사람의 방의 현재 스코어를 가지고 온다.
            room.score++; //현재 방 스코어를 1씩 증가한다.
		  

            var drawwer = room.drawwer;
            var userList = room.attendants;
            var len = room.attendants.length;

            var i = Math.ceil(Math.random()*len)-1;
            console.log('랜덤으로 선택한 드러우는 :'+room.attendants[i]);
            room.drawwer = room.attendants[i];

            var userInfo = Chat.getUserInfo(nickname); // 해당 방에서 맞춘 사람의 유저 리스트를 가지고 온다.
            userInfo.currentscore++; // 해당 유저의 totalscore 값을 증가 시킨다. 
            var usercurrentscore = userInfo.currentscore;
            console.log('증가 시킨 후의 현재 스코어의 값'+userInfo.currentscore);
            console.log('이 방의 최대 곡수는'+room.textMax+'이고 현재의 스코어는 '+room.score+'이다.');

            if(room.score === 3) {     // (room.textMax*1)) { // 만약에 이 수를 넘게 되면 게임 종료 이벤트를 발생시킨다.!''''"'"'"'"'
                console.log('게임 종료 이벤트!');
                // 현재 방의 참가자 수를 세고 나서 일일이 다 뿌려야 한다.
                console.log('----------------------------------------');
                var rooms = Chat.getRoomInfo(roomname); // 일단 방을 찾고
                //방의 참가자 리스트를 찾는다.
                var attendants = rooms.attendants; // 방 참가자 리스트를 찾고나서
                var lens = attendants.length; // 길이를 구하고
                var array= []; // 해당 방 사용자 정보를 담을 배열을 만들어서
                for(var i =0; i < lens; i++){ // 루프를 돌면서 array 배열에 집어넣는다.
                    array.push({User: Chat.getUserInfo(attendants[i])});
                }

                array.sort(function (a1, a2) {
                    console.log(a1.User.currentscore +'='+ a2.User.currentscore);
                    return (a1.User.currentscore > a2.User.currentscore) ? -1 : ((a1.User.currentscore < a2.User.currentscore) ? 1 : 0);
                });
			

                // 점수를 DB로 삽입한다.
                attendants = rooms.attendants;
                console.log(attendants);
                for(var i = 0; i < lens; i++) {
                    var man =  Chat.getUserInfo(attendants[i]);
                    man.totalscore = man.totalscore+man.currentscore;
                    client.query('UPDATE members SET totalscore=? WHERE nickname=?',[man.totalscore, man.name], function(err, results, fields) {
                        if (err) {
                        }else{
                            console.log('totalscore 값 바꾸기 성공');
                        }
                    });
                }
			

                socket.emit('gameEnd', {array:array, nickname:nickname, roomScore: room.score, usercurrentscore:usercurrentscore});
                socket.broadcast.to(roomname).emit('gameEnd', {array:array, nickname:nickname, roomScore: room.score, usercurrentscore:usercurrentscore});
            
            }else{  // 만약에 곡이 이 정도면 그냥 인크리즈스코어 이벤트를 활성화 시키고
                // 맞춘사람이름과, 맞춘사람의 점수, 현재 방의 점수, 드러워 

                var j = Math.ceil(Math.random()*199);
                var hint;
                client.query('SELECT name FROM hint WHERE id=?',[j], function(err, results, fields){
                    if(err){
                        //	console.log('샐랙트 에러');
                    }else{
                        console.log(results);
                        hint = results[0].name;
                        socket.emit('increaseScored', {nickname:nickname, roomScore: room.score, usercurrentscore:usercurrentscore, drawwer:drawwer, hint:hint });
                        socket.broadcast.to(roomname).emit('increaseScored', {nickname:nickname, roomScore: room.score, usercurrentscore:usercurrentscore, drawwer:drawwer, hint:hint });
                        console.log('increaseScored 이벤트 발생 시 받은 값은 제시어와 스코어다.'+nickname+room.score+drawwer+hint);
                    }
                });
            }
        });

        /// 게임 시작 하기를 했을 시.
        socket.on('game', function(data) { ////////////////////////////////////// 

            // 힌트 정하기, 드러워 정하기, 방인원 정하기, 현재 방 점수 정하기. 
            console.log('game 이벤트 발생!');
            var name;
            var roomname = data.roomname;
            var room = Chat.getRoomInfo(roomname);

            room.gameing = 1; 
            room.score = 0;
            room.drawwer = room.captin; 
            var drawwer = room.drawwer;

            // 해당 방 유저들의 currenscore를 0  으로 초기화하는 일을 하자.
            var attendants = room.attendants; // 방의 참가자를 담고
            var len = room.attendants.length; // 방의 인원수를 구해서 
            for (var i =0;i<len ; i++ ){//루프를 돌면서 해당 유저의 정보를 알아낸다.
                console.log(attendants[i]);
                var User = Chat.getUserInfo(attendants[i]);
                User.currentscore = 0;
            }

            var i = Math.ceil(Math.random()*199); // 랜덤 함수를 발생시킨다.
            client.query('SELECT name FROM hint WHERE id=?',[i], function(err, results, fields){
                if(err){
                    //	console.log('샐랙트 에러');
                }else{
                    name = results[0].name;
                    if (joinedRoom) {
                        socket.emit('gamed', {msName: name, score:room.score,  drawwer:drawwer});
                        socket.broadcast.to(joinedRoom).emit('gamed', {msName: name, score:room.score, drawwer:drawwer});
                        console.log('game 이벤트 발생 시-  제시어/스코어 :'+name+room.score);
                    }
                }
            });
        });

   


        socket.on('leave', function(data) {
            console.log('leave 이벤트가 발생하였다');
            console.log('검사 값 joinedRoom, data.nickNmae : '+joinedRoom + data.nickName);
            var beforeRoomInfo = Chat.getRoomInfo(joinedRoom);
			console.log('빼기전의 해당 방의 참여자 리스트의 길이는'+beforeRoomInfo.attendants.length); //2

			//Chat.deleteUser(joinedRoom, data.nickName);
			
            console.log(Chat.getRoomInfo(joinedRoom));
            if (joinedRoom) {
                Chat.leaveRoom(joinedRoom, data.nickName); ///제거하고 브로드 캐스팅으로 알려준다.
				var afterRoomInfo = Chat.getRoomInfo(joinedRoom);
				console.log('빼고 나서 해당 방의 길이는 '+afterRoomInfo.attendants.length);
				console.log('방나가고 나서 검사를 한다. '+afterRoomInfo);
				var userList = afterRoomInfo.attendants;
				if(userList.length === 0){
				   // 
				   console.log('만약 유저 목록의 길이가 0이면 이 해당 방을 rooms 배열에서 삭제를 한다.'+userList.length);
                   Chat.deleteRoom(joinedRoom);
				}
				else if(userList.length >0){
					var captin = beforeRoomInfo.captin;
					console.log('원래 캡틴은 '+ captin);
					console.log('만약에 나간 사람이 캡틴이라면');
					if(captin === data.nickName){
                           afterRoomInfo.captin = afterRoomInfo.attendants[0];
						   console.log('해당 방의 캡틴을 나간 후의 사용자리스트에서 첫번째 놈으로 바꿔준다.'+afterRoomInfo.captin+afterRoomInfo.attendants[0]);
					}
                    socket.broadcast.to(joinedRoom).emit('leaved', {nickName:data.nickName, captin:afterRoomInfo.captin });
                    socket.leave(joinedRoom);
				}
            }
        });
    });
}


