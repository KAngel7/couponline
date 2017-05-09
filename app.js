var express = require('express');
var app = express();
app.use(express.static('public'));
app.use(express.static('dashboard'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var listSocketUser = {};
var listSocketBoard = {};
var lobby = {
    listUser:[],
    listGame:{}
}
var gameId = 0;
function newGameId(){
    return ++gameId;
}

io.on('connection', function(socket) {
    socket.on('login', function(userName) {
        if(listSocketUser[userName]){
            socket.emit("afterLogin", {status:"fail", content:null});
        } else {
            socket.userName = userName;
            listSocketUser[userName] = socket;
            socket.emit("afterLogin", {status:"success", content:lobby});
            lobby.listUser.push(userName);
            io.sockets.emit("updateLobby", {status:"addUser", content: userName});
        }
    });
    socket.on('newGame', function() {
        var name = socket.userName;
        if(!lobby.listGame[name]){
            socket.onPlay = true;
            var gameId = newGameId();
            var game = {
                id: gameId,
                member: [name]
            }
            lobby.listGame[gameId] = game;
            listSocketBoard[gameId] = [socket];
            io.sockets.emit("updateLobby", {status:"removeUser", content: name});
            io.sockets.emit("updateLobby", {status:"addGame", content: game});
        }
    });
    socket.on('joinGame', function(gameId) {
        var name = socket.userName;
        if(lobby.listGame[gameId]){
            socket.onPlay = true;
            lobby.listGame[gameId].member.push(name);
            listSocketBoard[gameId].push(socket);
            io.sockets.emit("updateLobby", {status:"removeUser", content: name});
            io.sockets.emit("updateLobby", {status:"updateGame", content: game});
        }
    });
    socket.on('disconnect', function() {
        var userName = socket.userName;
        if(socket.onPlay){

        } else {
            var index = lobby.listUser.indexOf(userName);
            if (index > -1) {
                lobby.listUser.splice(index, 1);
            }
            io.sockets.emit("updateLobby", {status:"removeUser", content: userName});
            delete listSocketUser[userName];
        }
    });
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
});