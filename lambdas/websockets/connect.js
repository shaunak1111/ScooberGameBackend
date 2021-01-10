const Responses = require('../common/API_Responses');
const Dynamo = require('../common/Dynamo');
const WebSocket = require('../common/websocketMessage');

const tableName = process.env.tableName;

exports.handler = async (event, context, callback) => {
    console.log('event', event);

    const { connectionId: connectionID, domainName, stage } = event.requestContext;

    const data = {
        ID: connectionID,
        date: Date.now(),
        messages: [],
        domainName,
        stage,
    };

    await Dynamo.write(data, tableName);
    // Cannot send the ID to the client, 
    // await WebSocket.send({
    //     domainName,
    //     stage,
    //     connectionID,
    //     message: connectionID,
    // });

    // callback(null, Responses._200({ message: 'connected......' }))

    return Responses._200({ message: 'connected......' });
};
