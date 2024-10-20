/**
 * Chatroom Server using Express and Socket.io
 * 
 * This script sets up an Express server with Socket.io to handle real-time chat functionality,
 * including room management and messaging between users.
 */

const express = require("express");
const app = express();
const server = require("http").createServer(app);

const path = require("path");

const io = require("socket.io")(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname + '/public')));

/**
 * Event listener for new client connections.
 * When a user connects, this function will handle subsequent socket events like changing rooms, sending messages, and exiting.
 * 
 * @event connection
 * @param {Object} socket - The connected client socket.
 */
io.on('connection', socket => {
    console.log("A new user is connected!");

    /**
     * Event listener for the "changeRoom" event.
     * This event allows a user to leave their current room and join a new one. It emits an update to the new room
     * to notify other users of the new arrival.
     * 
     * @event changeRoom
     * @param {String} newRoom - The new room to join.
     * @param {String} username - The username of the client who is changing rooms.
     */
    socket.on("changeRoom", (newRoom, username) => {
        let oldRoom;
        
        // Leave the current room (if in one)
        socket.rooms.forEach(element => {
            if (element.startsWith("room")) {
                socket.leave(element);
                oldRoom = element;
            }
        });

        // Join the new room
        socket.join(newRoom);
        console.log(socket.rooms);

        // Notify others in the new room about the new user
        socket.broadcast.to(newRoom).emit("update", username + " a rejoint le salon !");
    });

    /**
     * Event listener for the "exitUser" event.
     * This event is triggered when a user exits the chat. It sends a broadcast to the room notifying others that the user has left.
     * 
     * @event exitUser
     * @param {String} username - The username of the client who is exiting.
     */
    socket.on("exitUser", username => {
        let room;

        // Find the current room the user is in
        socket.rooms.forEach(element => {
            if (element.startsWith("room")) room = element;
        });

        // Notify others in the room that the user has exited
        socket.broadcast.to(room).emit("update", username + " a quitté le salon !");
    });

    /**
     * Event listener for the "chat" event.
     * This event handles sending chat messages to the current room. The message is broadcast to all other users in the room.
     * 
     * @event chat
     * @param {Object} text - The chat message object containing the username and message.
     */
    socket.on("chat", text => {
        let room;

        // Find the room the user is in
        socket.rooms.forEach(element => {
            if (element.startsWith("room")) room = element;
        });

        // Broadcast the message to everyone in the room except the sender
        socket.broadcast.to(room).emit("chat", text);
    });
});

/**
 * Starts the server on port 5001 and logs a message indicating that the server is listening.
 * 
 * @listens port 5001
 */
server.listen(5001, () => console.log("Listening on port 5001"));
