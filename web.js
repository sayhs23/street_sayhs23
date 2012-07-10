/**
 * Module dependencies.
 */

var express = require('express')
  , url = require('url')
  , request = require('request')
  ,httpProxy = require('http-proxy');



var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('short'));
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
app.get('/elbem/:id', function(req, res) {
  var elbemName = req.params.id;
  console.log('/elbem/:id : '+elbemName); 
  res.render('elbem',{
	  elbemName: elbemName
  });
});

var proxyOptions = {
hostnameOnly: true,
	router: {
		'street.cafe24app.com/index': '127.0.0.1:8001'
	}
};

var proxyServer = httpProxy.createServer(proxyOptions);
proxyServer.listen(80);

app.listen(8001);
// Socket.iod
require('./rooms')(app);
console.log("runnig nodejs server nunning jung!~!");
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);