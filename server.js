const express = require("express")
const app = express()
const server = require("http").createServer(app)

const path = require("path")

const io = require("socket.io")(server)

app.use(express.static(path.join(__dirname + '/public')))

io.on('connection', socket => {
    console.log("A new user is connected !")

    socket.on("changeRoom", (newRoom, username) => {
        let oldRoom
        socket.rooms.forEach(element => {
            if(element.startsWith("room")) {
                socket.leave(element)
                oldRoom = element
            }
        });
        socket.join(newRoom)
        console.log(socket.rooms)
        socket.broadcast.to(newRoom).emit("update", username + " a rejoint le salon !")
    })

    socket.on("exitUser", username => {
        let room
        socket.rooms.forEach(element => {
            if(element.startsWith("room")) room = element
        });
        socket.broadcast.to(room).emit("update", username + " a quitté le salon !")
    })

    socket.on("chat", text => {
        let room
        socket.rooms.forEach(element => {
            if(element.startsWith("room")) room = element
        });
        socket.broadcast.to(room).emit("chat", text)
    })
})

server.listen(5001, () => console.log("Listening on port 5001"))