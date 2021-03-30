const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT
const public_dir_path = path.join(__dirname, '../public')

app.use('/', express.static(public_dir_path))

io.on('connection', socket => {
    console.log('New WebSocket connection')

    socket.emit('message', generateMessage('Welcome!'))
    socket.broadcast.emit('message', 'A new user has joined!')

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            callback('Profanity is not allowed!')
        }

        io.emit('message', generateMessage(message))
        callback()
    })

    socket.on('sendLocation', (position, callback) => {
        io.emit('locationMessage', generateMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat!')
    })
})

server.listen(port)