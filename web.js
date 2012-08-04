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


app.get('/room/:id', function(req, res) {
  var roomName = req.params.id;
  var nickname = req.session.nickname;

  console.log('/room/:id인데 이때의 세션값은:'+nickname);
  console.log('/room/:id인데 이때 방이름은:'+roomName+'세션 접속자이름은'+nickname);
  console.log('/여기서 이제 먼저 방정보를 가지고 온다. 그리고 유저 정보도 가지고 온다.');
  var roomInfo = Chat.getRoomInfo(roomName);
  console.log(roomInfo);
  console.log(roomInfo.name);
  console.log('-------------');
  console.log(roomInfo.textMax);
  console.log(roomInfo.userMax);
  console.log(roomInfo.captin);
  console.log(roomInfo.roomPublish);

  console.log('-------------');
  
  if(roomPublish===true) { //공개 모드일때
		 console.log('라우터에서 공개 모드일때 방이름 정보 해당 유저를 방에 넣는다.');
		 Chat.addRoom(roomName, roomInfo.textMax, roomInfo.userMax, nickname, roomInfo.roomPublish,'' );  // 방만들면 방이름(방명), 최대 게임 판수, 최대 제한 유저수, 방장이나온다.
  }
  else if(roomPublish ===false ) { // 비공개 모드
    	  console.log('라우터에서 비공개 모드일때 방이름과 방정보 그리고 해당 유저를 방에 넣는다.');
		  Chat.addRoom(roomName, roomInfo.textMax, roomInfo.userMax, nickname, roomInfo.roomPublish, roomInfo.roompw );  
   }
			 // 이제 방에 넣었으면 이걸 정보를 뿌려주자.
   console.log('nickname을 roomName방에 넣자'+nickname+roomName);
   Chat.joinRoom(roomName, nickname);
   console.log(Chat.getRoomInfo(roomName));

   var textMax = roomInfo.textMax;
   var userMax = roomInfo.userMax;
   var captin = roomInfo.captin;
   var roomPublish = roomInfo.roomPublish;
   var roompw = roomInfo.roompw;
   var attendants = roomInfo.attendants;
   

	 res.render('room', {
         nickname : nickname
       , textMax: textMax
       , userMax: userMax
       , roomPublish:roomPublish
       , roompw: roompw
       , roomName:roomName
       , attendants: attendants
     });
/*  var user = Chat.getUser(req.session.nickname);
  var level = user.level;
  
  if (Chat.hasRoom(roomName)) {
	isSuccess = true; 
  }*/


   
 /* res.render('room', {
	  isSuccess: isSuccess
	, roomName: roomName
	, musicnumber: 10
	, level: level
	, nickname: req.session.nickname
	, attendants: Chat.getAttendantsList(roomName)
  });*/
});

app.get('/elbem/:id', function(req, res) {
  var elbemName = req.params.id;
  console.log('/elbem/:id : '+elbemName); 
  res.render('elbem',{
	  elbemName: elbemName
  });
});
/////////////////////////////////////////////////////////////백  : bagName //////////////////////////////////////////////////////////////////
app.get('/bag/:id', function(req, res) {
  var bagName = req.params.id;
  console.log('/bagName/:id : '+bagName); 
  res.render('bag',{
	  bagName: bagName
  });
});

////////////////////////////////////////////////////////////커뮤니티 : communityName ////////////////////////////////////////////////////
app.get('/community/:id', function(req, res) {
	var communityName = req.params.id;
	console.log('/community/:id :'+communityName);
	res.render('community', {
		communityName: communityName
	});
});

app.get('/gStreet', function(req, res) {
  res.render('gStreet');
});


app.post('/waitingRoom', function(req, res) {
   console.log('/waitingRoom 이벤트 호출');
   var nickname = req.body.inputNickName;
   console.log(nickname);
   repo.checkNickName(req, res);
});

app.get('/cStreet', function(req, res) {
  res.render('cStreet');
});


app.get('/sStreet', function(req, res) {
  res.render('sStreet');
});
app.get('/gStreet', function(req, res) {
  res.render('gStreet');
});


app.listen(8001);
// Socket.iod
require('./rooms')(app);
console.log("runnig");
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);