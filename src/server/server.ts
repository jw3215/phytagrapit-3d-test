// When starting this project by using `npm run dev`, this server script
// will be compiled using tsc and will be running concurrently along side webpack-dev-server
// visit http://127.0.0.1:8080

// In the production environment we don't use the webpack-dev-server, so instead type,
// `npm run build`        (this creates the production version of bundle.js and places it in ./dist/client/)
// `tsc -p ./src/server`  (this compiles ./src/server/server.ts into ./dist/server/server.js)
// `npm start            (this starts nodejs with express and serves the ./dist/client folder)
// visit http://127.0.0.1:3000

import express from 'express'
import path from 'path'
import http from 'http'
import { Server, Socket } from 'socket.io'
import cors from "cors";

const port: number = 3000

class App {
  private server: http.Server
  private port: number

  private io: Server
  private clients: any = {}
  private camera: any = {}

  constructor(port: number) {
    this.port = port
    const app = express()
    app.use(express.static(path.join(__dirname, '../client')))
    app.use(cors())

    this.server = new http.Server(app)

    this.io = new Server(this.server)

    this.io.on('connection', (socket: Socket) => {
      console.log(socket.constructor.name)
      this.clients[socket.id] = {}
      console.log(this.clients)
      console.log('a user connected : ' + socket.id)
      socket.emit('id', socket.id)

      socket.on('disconnect', () => {
        console.log('user disconnected')
        delete this.clients[socket.id]
      })

      socket.on('cameraChange', (data: any) => {
        this.camera = data
        this.io.emit('updateCamera', data)
      })

      socket.on('sphereChange', (id: string, data: any) => {
        this.camera = data
        this.io.emit('updateSphere', id, data)
      })

    })

    // setInterval(() => {
    // console.log(this.camera)
    // }, 50)
  }

  public Start() {
    this.server.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}.`)
    })
  }
}

new App(port).Start()
