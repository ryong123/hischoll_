const {
  User,
  Dm
} = require("../models/Index");

const roomList = [];
exports.connection = (io, socket) => {
    console.log('접속 :', socket.id);
    //채팅방 목록 보내기
    socket.emit('roomList', roomList);

    
    //채팅방 만들기 생성
    socket.on('create', async (roomName, userName, cb) => {
      //join(방이름) 해당 방이름으로 없다면 생성. 존재하면 입장
      //socket.rooms에 socket.id값과 방이름 확인가능
      socket.to(roomName).emit('notice', `${userName}님이 입장하셨습니다`);
        socket.join(roomName);
        //socket은 객체이며 원하는 값을 할당할 수 있음
        socket.room = roomName;
        socket.user = userName;


        //채팅방 목록 갱신
        if (!roomList.includes(roomName)) {
            roomList.push(roomName);
            //갱신된 목록은 전체가 봐야함 <=== 나와 상대방만 봐야해서 이제 바꿔야함
            io.emit('roomList', roomList);
        }
        // const usersInRoom = getUsersInRoom(roomName);
        // io.to(roomName).emit('userList', usersInRoom);
        cb();
    });
    //================ 위 까지 방만들기 =======================
    socket.on('sendMessage', async (message) => {
        console.log(">>>>>>>>>>>",message);
        console.log("Csocket Message From Nick >>>>",message.from_nick)
        const NewChatMessage = await Dm.create({
          dm_content: message.message,
          room_name: message.room,
          userid_num: message.userid_num,
          from_nick: message.from_nick
        });
        console.log("NEW CHAT MESSAGE>>>>>>>>>>>>",NewChatMessage.dm_content);
        io.to(socket.room).emit('newMessage', NewChatMessage, NewChatMessage.from_nick);
      });

    socket.on('disconnect', () => {
        if (socket.room) {
            socket.leave(socket.room);
            console.log("연결 해제")
        }
    });
};