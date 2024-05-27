const { format } = require('date-fns')
const path = require('path');
const fs = require('fs');

function createData(contact,message){
    const now = new Date();
    const formattedDate = format(now, 'dd/MM/yyyy');
    const formattedTime = format(now, 'HH:mm:ss');
    const data = {
        name: contact.pushname,
        number: contact.number,
        lastDate:formattedDate,
        lastTime:formattedTime,
        lastMessage: message.body,
        state: "inicio"
    };  

    return data
}

//exports
module.exports={
    async messageHandler(message,db){
        let [chat,contact] = await Promise.all([message.getChat(),message.getContact()])
        try {
            if(!chat.isGroup){

                const data = createData(contact,message)
                const res = await db.collection('clients').find( {name: data.name, number: data.number}).toArray()
                if(message.hasMedia){
                    const mediaData = await message.downloadMedia();

                    // Determina o caminho onde o arquivo será salvo
                    const mediaPath = path.join(__dirname, 'media');
        
                    // Cria o diretório 'media' se ele não existir
                    if (!fs.existsSync(mediaPath)) {
                        fs.mkdirSync(mediaPath);
                    }
        
                    // Determina o nome do arquivo com base no timestamp atual e na extensão da mídia
                    const fileName = `${data.name}${Date.now()}.${mediaData.mimetype.split('/')[1]}`;
        
                    // Caminho completo do arquivo
                    const filePath = path.join(mediaPath, fileName);
        
                    // Escreve o conteúdo da mídia no arquivo
                    const binaryData = Buffer.from(mediaData.data, 'base64');
                    fs.writeFileSync(filePath, binaryData,'binary');
                }
                
                if(res.length === 0 && data.name!= null){
                    db.collection('clients').insertOne(data)
                    console.log(message.body)
                }else{
                    db.collection('clients').updateOne(
                        {name: data.name, number: data.number}, 
                        {$set:{
                            lastDate: data.lastDate,
                            lastTime: data.lastTime,
                            lastMessage: data.lastMessage
                        }}
                    )
                }
                
            }
        } catch (error) {
            console.log(error)
        }
        

    }
}