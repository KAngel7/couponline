var mainStatus = "login";
var userName, $main;
var socket = io();
var clientLobby = {
    init: function (serverLobby) {
        $main.empty();
        mainStatus = "lobby";
        clientLobby.listUser = {};
        clientLobby.listGame = {};
        clientLobby.$listUser = $("<div id='listUser'><div class='header'>List User</div></div>");
        clientLobby.$listGame = $("<div id='listGame'><div class='header'>List Game</div></div>");
        var $newGame = $("<div class='newGame'>Create new game</div>").on("click", function(){
            socket.emit("newGame");
        });
        clientLobby.$listGame.find(".header").append($newGame);
        var $lobby = $("<div></div>");
        clientLobby.listUser = {};
        for(var i in serverLobby.listUser){
            var name = serverLobby.listUser[i];
            clientLobby.addUser(name);
        }
        for(var i in serverLobby.listGame){
            var game = serverLobby.listGame[i];
            clientLobby.addGame(game);
        }
        clientLobby.$listGame.on("click", "span", function(){
            socket.emit("joinGame", $(this).data("gameId"));
        });
        $lobby.append(clientLobby.$listUser, clientLobby.$listGame);
        $main.append($lobby);
    },
    addUser: function(name, me){
        var $block = $("<span>"+name+"</span>");
        clientLobby.listUser[name] = {
            $block: $block
        }
        clientLobby.$listUser.append($block);
    },
    removeUser: function(name){
        clientLobby.listUser[name].$block.remove();
        delete clientLobby.listUser[name];
    },
    addGame: function(game){
        var $block = $("<span>"+game.member.join(", ")+"</span>");
        $block.data("gameId", game.id);
        clientLobby.listGame[game.id] = {
            name: game.name,
            $block: $block
        }
        clientLobby.$listGame.append($block);
    },
    updateGame: function(game){
        clientLobby.listGame[game.id].member = game.member;
        clientLobby.listGame[game.id].$block.val(game.member.join(", "));
        clientLobby.$listGame.append($block);
    },
    removeGame: function(id){
        clientLobby.listGame[id].$block.remove();
        delete clientLobby.listGame[id];
    },
}
var clientGame = {
    init:function(){
        $main.empty();
        mainStatus = "game";
    }
}


socket.on('afterLogin', function(res) {
    if(res.status = "afterLogin"){
        clientLobby.init(res.content);
    } else {
        console.log("loginFail");
    }
});
socket.on('updateLobby', function(res) {
    if(mainStatus == "lobby"){
        clientLobby[res.status](res.content);
    }
});
function initLogin(){
    $main.empty();
    mainStatus = "loggin";
    $main.append("<div id='login'>\
        <input placeholder='Your name' class='userName'></input>\
        <button>Login</button>\
    </div>");
    $main.find("#login").on('click', "button", function() {
        userName = $(this).prev().val();
        if (userName && userName.length > 0) {
            socket.emit('login', userName);
        }
    });
}
$(document).ready(function(){
    $main = $("#main");
    initLogin();
});