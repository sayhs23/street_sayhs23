       var name;
		var hint;
		var id;
		var cnt;

var Music = module.exports = {
	
	setMusic: function() {
		var mysql = require('mysql');
        

		var client = mysql.createClient({
			user: 'root',
			password: 'root',
			database: 'node_test'
		});

		

		client.query('USE node_test');
		client.query('SELECT * FROM test', function (error, result, fields) {
		result.charset ='utf-8';

		if (error) {
				console.log('쿼리 중 오류 발생');
		} else {

            

			i = Math.ceil(Math.random()*3);

			id = result[i].id;
			name = result[i].name;
			hint = result[i].hint;
			console.log('Music.js에서 셋팅 게임 음악 정보 셋팅'+ id + name + hint );
		 }
	});

	}

    ,getId: function () {
        return id;
    }
	,getName: function() {
		return name;
	}
	,getHint: function() {
		return hint;
	}
}

