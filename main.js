
const qrcode = require('qrcode-terminal')
const { Client, LocalAuth } = require('whatsapp-web.js')
const {connectToDb, getDb} = require("./db")
const { messageHandler } = require('./massages')

//whatsapp client connection
const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
})
client.on('ready', () => {
    console.log('Client is ready!');
})

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
})

//mongodb connection
let db
let err_flag
connectToDb((err)=>{
    if(!err){
        db = getDb()
        console.log("db connected!")
    }
    else{
        console.log(err)
        err_flag = true
    }
})

//robot messages
if(!err_flag){
    client.on('message_create',(message)=>messageHandler(message,db))
}

client.initialize()

