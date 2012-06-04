var Room = require('./Room');

var Chat = module.exports = {
    users: []
  , rooms: []
  , waitusers: []
    // 사용자 관련
  , hasUser: function(nickname) {
      var users = this.users.filter(function(element) {
        return (element.nickname === nickname);   
      });

      if (users.length > 0) {
        return true;
      } else {
        return false; 
      }
    }
  , addUser: function(nickname, name, email, level, totalscore) {
      this.users.push({nickname:nickname, name:name, email:email, level:level, totalscore:totalscore});
    }
	,addWaitUser: function(nickname, name, email, level, totalscore) {
      this.waitusers.push({nickname:nickname, name:name, email:email, level:level, totalscore:totalscore});
    }
    // 방 관련
  , hasRoom: function(roomName) {

      var rooms = this.rooms.filter(function(element) {
        return (element.name === roomName);   
      });

      if (rooms.length > 0) {
        return true;
      } else {
        return false; 
      }
    }
  , getAttendantsNum: function(roomName) { //파라미터 방 이름 : 현재 방 입장하고 있는 놈 세는 것.
	 var rooms = this.rooms.filter(function(element) {
        return (element.name === roomName);   
      });
	  return rooms[0].attendants.length;
  }
  , addRoom: function(roomName,musicmax, captin, usermax) {
      this.rooms.push({name:roomName, attendants:[],captins:captin, musicmaxs:musicmax, usermaxs:usermax});
    }
  , getRoomList: function() {
      return this.rooms.map(function(element) {
        return element.name;
      });;
    }
	,getWaitUserList: function() {
      return this.waitusers;
	}
	, getRoomInfo: function() {
      return this.rooms.map(function(element) {
        return element;
      });;
    }
  , joinRoom: function(roomName, user) {
      var rooms = this.rooms.filter(function(element) {
        return (element.name === roomName);   
      });
      if (!this.hasAttendant(rooms[0].attendants, user)) {
        rooms[0].attendants.push(user);
      }
    }
  , hasAttendant: function(attendants, user) {
      return attendants.some(function(element) { 
        return (element === user);
      });
    }
  , leaveRoom: function(roomName, user) {
	  console.log('leaveRoom');
      var rooms = this.rooms.filter(function(element) {
        return (element.name === roomName);   
      });
      rooms[0].attendants.forEach(function(element, index, arr) {
        if (element.nickname === user) {
          arr.splice(index, 1);
		  
		    console.log('몇명남았는지검사'+rooms[0].attendants.length);
	    
			if (rooms[0].attendants.length === 0) {
				//this.rooms.pop(rooms[0]);//여기서 방 입장 인원 수가 0이면 즉 아무도 없을 경우에 이 방을 rooms 배열에서 빼버린다.
			}
        }
		
      });
    }
, getUser: function(user) {
	console.log('여기는 갯 유저 메서드 , 방이름, 사용자이름 넣으면 배열에서 빼서 정보를 이용하기 위해서');

	var users = this.users.filter(function(element) {
		console.log('리턴하는 element 객체의 이름은: '+element.nickname);
		console.log(element.nickname === user);
		return (element.nickname === user);
	});
	console.log('user.nickname '+users[0].nickname);
	return users[0];
}
, deleteRoom: function(roomName) {
		this.rooms.pop(roomName);
  }
  , deleteNickName: function(nickname) {
	 this.users.pop(nickname);
  }
  , getAttendantsList: function(roomName) {
      var rooms = this.rooms.filter(function(element) {
        return (element.name === roomName);   
      });
     return rooms[0].attendants;
    }
}
