/**
 * Chatroom Application
 * 
 * This immediately invoked function expression (IIFE) initializes the chatroom interface, manages
 * event listeners for user interactions, and communicates with the server using Socket.io.
 * 
 * @function
 */
(function() {
    // References the app's main container and establishes a connection to the server using Socket.io.
    const app = document.querySelector(".app"),
        socket = io();
    let username, room = 1;

    /**
     * Event listener for the "Join" button.
     * When clicked, it retrieves the username from the input field, emits a "changeRoom" event to the server,
     * and switches the UI from the join screen to the chat screen.
     * 
     * @event click
     */
    app.querySelector("#join-user").addEventListener('click', () => {
        username = app.querySelector("#username").value;
        if (username.length == 0) return;

        // Emit "changeRoom" event to the server for 'room 1' with the provided username
        socket.emit("changeRoom", 'room 1', username);

        // Switch UI to chat screen
        app.querySelector(".join-screen").classList.remove("active");
        app.querySelector(".chat-screen").classList.add("active");
    });

    /**
     * Event listener for the "Send Message" button.
     * When clicked, it retrieves the typed message, renders it locally, and sends the message to the server.
     * 
     * @event click
     */
    app.querySelector("#send-message").addEventListener("click", () => {
        let message = app.querySelector(".chat-screen input").value;
        if (message.length == 0) return;

        // Render the message locally as 'me'
        renderMessage("me", { user: 'You', message });

        // Emit the 'chat' event to the server with the username and message
        socket.emit("chat", { username, message });

        // Clear the message input field
        app.querySelector(".chat-screen input").value = '';
    });

    /**
     * Event listener for the "Exit Chat" button.
     * When clicked, it emits an "exitUser" event to the server and reloads the page to reset the app.
     * 
     * @event click
     */
    app.querySelector("#exit-chat").addEventListener("click", () => {
        // Notify the server that the user has exited
        socket.emit("exitUser", username);

        // Reload the page to reset the chat interface
        window.location.reload();
    });

    /**
     * Event listeners for changing chat rooms.
     * Adds a click listener to each room button, emits the appropriate room change to the server, and updates the UI.
     * 
     * @event click
     */
    app.querySelectorAll(".rooms .room").forEach((el, index) => el.addEventListener("click", () => {
        // Notify the server that the user has exited the current room
        socket.emit("exitUser", username);

        // Emit "changeRoom" event to switch to the selected room
        socket.emit("changeRoom", "room " + (index + 1), username);

        // Update the active room in the UI
        app.querySelector(".rooms .room:nth-child(" + room + ")").classList.remove("active");
        room = (index + 1);
        app.querySelector(".rooms .room:nth-child(" + room + ")").classList.add("active");

        // Clear the chat messages display
        app.querySelector(".messages").innerHTML = '';
    }));

    /**
     * Receives chat messages from the server and renders them in the UI.
     * 
     * @event socket.on
     * @param {Object} message - The message object from the server containing the sender and message content.
     */
    socket.on("chat", message => renderMessage("other", message));

    /**
     * Receives system updates (like user joining/exiting) and displays them in the chat.
     * 
     * @event socket.on
     * @param {String} message - The system update message.
     */
    socket.on("update", message => renderMessage("update", message));

    /**
     * Renders a message in the chat UI.
     * This function handles different types of messages: 'me' for the current user, 'other' for other users, 
     * and 'update' for system messages.
     * 
     * @param {String} type - The type of message ('me', 'other', or 'update').
     * @param {Object} message - The message object containing the sender and message content.
     */
    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        let el = document.createElement("div");

        if (type == 'me') {
            el.setAttribute("class", "message my-message");
            el.innerHTML = `
                <div>
                    <p class="name">You</div>
                    <p class="text">${message.message}</div>
                </div>
            `;
        } else if (type == "other") {
            el.setAttribute("class", "message other-message");
            el.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.message}</div>
                </div>
            `;
        } else {
            el.setAttribute("class", "update");
            el.innerText = message;
        }

        // Append the new message to the chat message container
        messageContainer.appendChild(el);
    }
})();
