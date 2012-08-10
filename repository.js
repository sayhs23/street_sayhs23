Chat = require('./chat');

var mysql = require('mysql')
  , DATABASE = 'node_test'
  , TABLE = 'members'
  , client = mysql.createClient({
      user: 'sayhs23'
	, host: '10.0.0.1'
    , password: '9034gustn'
  });

client.query('USE ' + DATABASE);

var mysqlUtil = module.exports = {
 checkNickName: function(req, res) {
	   var nickName = req.body.inputNickName;
		   var pws = req.body.inputPw;

		   client.query('SELECT pws FROM members WHERE nickname=?', [nickName], function(err, results, fields){
						if(err){
							console.log('로그인 오류.');
						}else{
							try{
								var serverpws = results[0].pws;
							}catch(e){
							//   socket.emit('logined-fail');
								  console.log('에러 발생 1');
							}
							
							if(serverpws == pws) {
								client.query('SELECT * FROM members WHERE nickname=?', [nickName], function(err, results, fields){
									if(err){
										console.log('재 결과 탐색시 에러. 발생');
									}else{
										console.log(results);
										var nickName = results[0].nickname;
										var level = results[0].level;
										var totalscore = results[0].totalscore;
										req.session.nickname =nickName;

										console.log('해당 유저를 이제는 users 배열에 담는다. 세션 유지를 위해선');
										Chat.addUser(nickName, level, totalscore);
										console.log('갯 유저 인포 함수는');
										var userInfo = Chat.getUserInfo(nickName);
										console.log(userInfo);
										console.log('repository.js 에서 세션값은->'+req.session.nickname );

									//	socket.emit('logined', { nickName:nickName, level: level, totalscore:totalscore});
									res.render('waitingRoom', {
									  nickname: results[0].nickname
								    , level: results[0].level
								    , totalscore: results[0].totalscore
								   , title: 'Express'
									  });
									}
								});
							}else{
									//	socket.emit('logined-fail');
									console.log('에러 발생 2');
							}
						}
					});
    }
, hasNickName: function(user, res) {
      client.query(
          'SELECT * FROM ' + TABLE + ' WHERE nickname = ?'
        , [user.nickname]
        , function(err, results, fields) {
            if (err) {
              throw err;
            }
            if (results.length > 0) {
              res.render('join-fail', {
                  title: 'Express'
              });
            } else {
              mysqlUtil.insertUser(user, res);
            }
      });
    }

};
