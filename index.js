
import mineflayer from 'mineflayer'
import net from 'net'
import http from 'http'

/* ================== CONFIG ================== */
const SERVER_HOST = 'ZyveriaMC.aternos.me'
const SERVER_PORT = 29079
const BOT_NAME = 'KeepAliveBotsesf'
const MC_VERSION = '1.21.1'
const CHECK_INTERVAL = 30_000 // 30 seconds
/* ============================================ */

// Small HTTP server (needed for some hosts, harmless elsewhere)
http.createServer((_, res) => {
  res.writeHead(200)
  res.end('KeepAlive bot running')
}).listen(3000)

let botActive = false

// Lightweight server ping (no extra libraries)
function pingServer(callback) {
  const socket = net.createConnection(SERVER_PORT, SERVER_HOST)
  socket.setTimeout(3000)

  socket.on('connect', () => {
    socket.end()
    callback(true)
  })

  socket.on('timeout', () => {
    socket.destroy()
    callback(false)
  })

  socket.on('error', () => {
    callback(false)
  })
}

function joinAndLeave() {
  botActive = true

  const bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
    username: BOT_NAME,
    version: MC_VERSION
  })

  bot.once('login', () => {
    console.log('✅ Bot joined server')
  })

  setTimeout(() => {
    bot.quit('keepalive exit')
    console.log('👋 Bot left server')
    botActive = false
  }, 5000)

  bot.on('error', err => {
    console.log('❌ Bot error:', err.message)
    botActive = false
  })

  bot.on('end', () => {
    botActive = false
  })
}

// Check loop
setInterval(() => {
  if (botActive) return

  pingServer(isOnline => {
    if (!isOnline) {
      console.log('🔴 Server offline')
      return
    }

    console.log('🟢 Server reachable, checking players…')
    joinAndLeave()
  })
}, CHECK_INTERVAL)

console.log('🚀 KeepAlive bot started')
