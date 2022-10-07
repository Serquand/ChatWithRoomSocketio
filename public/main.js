(function() {
    const app = document.querySelector(".app"), socket = io();
    let username, room = 1;

    app.querySelector("#join-user").addEventListener('click', () => {
        username = app.querySelector("#username").value 
        if(username.length == 0) return
        socket.emit("changeRoom", 'room 1', username)
        app.querySelector(".join-screen").classList.remove("active")
        app.querySelector(".chat-screen").classList.add("active")
    })
    
    app.querySelector("#send-message").addEventListener("click", () => {
        let message = app.querySelector(".chat-screen input").value
        if(message.length == 0) return
        renderMessage("me", { user: 'You', message })

        socket.emit("chat", { username, message })

        app.querySelector(".chat-screen input").value = ''
        
    })

    app.querySelector("#exit-chat").addEventListener("click", () => {
        socket.emit("exitUser", username)
        window.location.reload()
    })
    
    app.querySelectorAll(".rooms .room").forEach((el, index) => el.addEventListener("click", () => {
        socket.emit("exitUser", username)
        socket.emit("changeRoom", "room " + (index + 1), username)
        app.querySelector(".rooms .room:nth-child(" + room + ")").classList.remove("active")
        room = (index + 1)
        app.querySelector(".rooms .room:nth-child(" + room + ")").classList.add("active")
        app.querySelector(".messages").innerHTML = ''
    }))

    socket.on("chat", message => renderMessage("other", message))
    socket.on("update", message => renderMessage("update", message))

    function renderMessage(type, message) {
        let messageContainer = app.querySelector(".chat-screen .messages");
        let el = document.createElement("div");
        if(type == 'me') {
            el.setAttribute("class", "message my-message")

            el.innerHTML = `
                <div>
                    <p class="name">You</div>
                    <p class="text">${message.message}</div>
                </div>
            `
        } else if(type == "other") {
            el.setAttribute("class", "message other-message")

            el.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.message}</div>
                </div>
            `
        } else {
            el.setAttribute("class", "update")
            el.innerText = message
        }
        messageContainer.appendChild(el)
    }
})();