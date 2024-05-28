const { differenceInMinutes } = require('date-fns')

//FUNCOES QUE UTILIZAM OS DADOS
function createData(contact,message){
    const now = new Date();
    const data = {
        name: contact.pushname,
        number: contact.number,
        lastInteraction: now,
        lastMessage: message.body,
        state: "inicio"
    };  

    return data
}
function hasTenMinutesPassed(lastInteraction) {
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, lastInteraction);
    return diffInMinutes >= 10;
}

async function welcomeClient(contact,message,db) {
    const data = createData(contact,message)
    const res = await db.collection('clients').find( {name: data.name, number: data.number}).toArray()

    if(res.length === 0 && data.name!= null){
        db.collection('clients').insertOne(data)
        console.log(message.body)
    }else{
        let client = res[0]
        if(hasTenMinutesPassed(client.lastInteraction)){
            await db.collection('clients').updateOne(
                {name: data.name, number: data.number}, 
                {$set:{
                    lastInteraction: data.lastInteraction,
                    lastMessage: data.lastMessage,
                    state: "inicio"
                }}
            )
        }else{
            await db.collection('clients').updateOne(
                {name: data.name, number: data.number}, 
                {$set:{
                    lastInteraction: data.lastInteraction,
                    lastMessage: data.lastMessage
                }}
            )
        }
        
    }

    return data
}

//FUNÇOES QUE MANEJAM OS ESTADOS 
async function getState(data,db){
    try {
        const res = await db.collection('clients').find( {name: data.name, number: data.number}).toArray()
        return res[0].state
        
    } catch (error) {
        console.log(error)
    }   
}

async function setState(data,nextState,db){
    await db.collection('clients').updateOne( 
                                            {name: data.name, number: data.number},
                                            {$set:{state: nextState}}
                                        )

}

//exports
module.exports={
    async messageHandler(message,db){
        let [chat,contact] = await Promise.all([message.getChat(),message.getContact()])
        try {
            if(!chat.isGroup && !message.isStatus && contact.number === "???"){
                client = await welcomeClient(contact,message,db)
                switch (await getState(client,db)) {
                    case "inicio":
                        await chat.sendMessage(`Olá ${client.name} você deseja:\na) agendar uma consulta\nb) sla oq\nc) sair`)
                        await setState(client,"respostaInicio",db)
                        break;
                    
                    case "respostaInicio":
                        switch (message.body.toLowerCase()) {
                            case "a":
                            case "a)":
                                await chat.sendMessage("qual horario?")
                                await setState(client,"agendarConsulta",db)
                                break
                            case "b":    
                            case "b)":
                                await chat.sendMessage("boto fe, tmj")
                                await setState(client,"inicio",db)
                                break
                            case "c":
                            case "c)":
                                await chat.sendMessage("ate logo!")
                                await setState(client,"inicio",db)
                                break
                            default:
                                await chat.sendMessage("Nao Entendi, digite:\na) agendar uma consulta\nb) sla oq\nc) sair")
                                break
                        }
                        break
                    case "agendarConsulta":
                        await chat.sendMessage("ainda nao implementada")
                        await setState(client,"inicio",db)
                        break;
                    default:
                        break;
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
}