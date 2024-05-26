
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth(),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
client.on('message_create', async message => {
    const chat =  await message.getChat()
    if(message.fromMe){
        console.log(message.body);
   
    }
    if(!chat.isGroup){
        if(message.body ==="sexo?"){
            try {
                const contact = await message.getContact(); 
                message.reply("naaaooo"); 
                client.sendMessage(chat.id._serialized,"tu e esse?: " + contact.pushname+ " " + contact.number+ " "); // Use chat.id._serialized para obter o ID do chat como string
            } catch (error) {
                console.error('Erro ao obter contato ou chat:', error);
            }
        }
        if(message.body ==="oi leo"){
           
            try {
                const contact = await message.getContact(); 
                message.reply("Olá!"); 
                client.sendMessage(chat.id._serialized,"seus dados sao:" + contact.pushname+ " " + contact.number+ " "); // Use chat.id._serialized para obter o ID do chat como string
            } catch (error) {
                console.error('Erro ao obter contato ou chat:', error);
            }
        }
    }
});
client.initialize();

