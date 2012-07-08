/**
 * Module dependencies.
 */

var express = require('express')
  , url = require('url')
  , request = require('request')
  , Chat = require('./chat')
  , repo = require('./repository');


var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser()); // 바디 파서 미들웨어는 POST 요청을 할 때 데이터를 쉽게 추출할 수 있게 하는 미들웨어입니다....
  app.use(express.cookieParser());  // 쿠키 파서 미들웨어를 사용하면 request 객체에 cookies 속성이 부여된다. 
  app.use(express.session({secret: 'secret key'}));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){
 /* res.header("Access-Control-Allow-Headers","X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header("Access-Control-Max-Age",'86400');
  res.header("Access-Control-Allow-Credentials",false);
  res.header("Access-Control-Allow-Methods","POST, GET, PUT, DELETE, OPTIONS");

  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");*/ 
  res.render('index');
});
app.post('/gStreet', function(req, res) {
	repo.checkNickName(req, res);
});

app.get('/add/:id', function(req, res) {                         //추가기능 누르기  GET방식으로 하기.
	var isSuccess = true;
	var name = req.params.id;
	console.log(name);
    var level = 0;
	var totalscore = 0;
	res.render('add', {
		isSuccess: isSuccess 
		, nickname: name
		, level: level
		, totalscore: totalscore
		, waitUser: Chat.getWaitUserList()
		,title: 'Express'
		});
});
//---------------------인덱스 페이지에서 검색어 get방식 /검색어 라우터 부분 -----------------//

app.get('/search/:id', function(req, res) {
  var searchName = req.params.id;
  console.log('/search/:id  '+searchName); 
  res.render('search',{
	  searchName: searchName
  });
});

app.get('/mStreet', function(req, res) { //회원 가입 창 렌더링......!
	res.render('mStreet');
});

app.get('/join-form', function(req, res) { //회원 가입 창 렌더링......!
	res.render('join-form');
});

app.post('/joins', function(req, res) {
	var nickname = req.body.nickname;
	if(nickname && nickname.trim() !== ''){
		repo.hasNickName(req.body, res);
	}
});

/*
app.get('/enter/:id', function(req, res) {
	console.log('\u001b[36m', '  app.get(/enter) ');
	console.log('\u001b[36m', '  -> req.params.id =  '+req.params.id);

    var nickname = req.params.id;

    res.render('enter', {
        isSuccess: true
      , nickname : nickname
      , roomList: Chat.getRoomList()
    });
});
*/
app.get('/enter', function(req, res) {
  var user = Chat.getUser(req.session.nickname);

  if (req.session.nickname) {
    res.render('enter', {
        isSuccess: true 
      , nickname: req.session.nickname
      , level: user.level
	  , totalscore: user.totalscore 
      , roomList: Chat.getRoomList()
	  , roomInfo: Chat.getRoomInfo()
	  , waitUser: Chat.getWaitUserList()
    });
  } else { 
    res.render('enter', {
        isSuccess: false 
      , nickname: ''
    });

  }
});
app.post('/makeRoom', function(req, res) {
  var isSuccess = false
  , roomName = req.body.roomname; // 방제
  var musicmax = req.body.musicmax; // 최대 곡수
  var captin = req.body.nickname; // 방장 -> 방장에게 시작 권한을 주기 위해서.
  var usermax = req.body.usermax; // 최대 인원 수 갑 받음.


 console.log('/makeRoom musicmax, captin, usermax: '+musicmax + captin + usermax);


  if(roomName && roomName.trim() != '') {
    if (!Chat.hasRoom(roomName)) {
      Chat.addRoom(roomName, musicmax, captin, usermax);
      isSuccess = true;
    }
  }

  res.render('makeRoom', {
      isSuccess: isSuccess
    , musicmax: musicmax
    , roomName: roomName
  });
});

app.get('/join/:id', function(req, res) {
  var isSuccess = false
    , roomName = req.params.id;

  var user = Chat.getUser(req.session.nickname);
  var level = user.level;
  
  if (Chat.hasRoom(roomName)) {
    isSuccess = true; 
  }

  console.log('/join/:id  , '+isSuccess+ roomName, level, Chat.getAttendantsList(roomName));
   
  res.render('room', {
      isSuccess: isSuccess
    , roomName: roomName
	, musicnumber: 10
    , level: level
    , nickname: req.session.nickname
    , attendants: Chat.getAttendantsList(roomName)
  });
});

app.get('/elbem/:id', function(req, res) {
  var elbemName = req.params.id;
  console.log('/elbem/:id : '+elbemName); 
  res.render('elbem',{
	  elbemName: elbemName
  });
});


app.get('/logout/:name', function(req, res) {

 var nickname = req.params.name; //로그아웃한놈 저장해서

 Chat.deleteNickName(nickname);
 res.render('index'); //하고서 index.로 이동하기.
});


app.listen(8001);
// Socket.iod
require('./rooms')(app);
console.log("runnig");
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);