const path = require('path');
const fs = require('fs');
//at work
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