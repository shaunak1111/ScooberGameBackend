const Responses = require('../common/API_Responses');
const Dynamo = require('../common/Dynamo');
const WebSocket = require('../common/websocketMessage');

const tableName = process.env.tableName;

exports.handler = async event => {
    console.log('event', event);

    const { connectionId: connectionID } = event.requestContext;

    const body = JSON.parse(event.body);

    try {
        // const record = await Dynamo.get(connectionID, tableName);
        // const { messages, domainName, stage } = record;

        // messages.push(body.message);

        // const data = {
        //     ...record,
        //     messages,
        // };

        // await Dynamo.write(data, tableName);

        // Find the other Connection ID
        const result = await Dynamo.scan(tableName);
        console.log('scan', result);

        // find the other item
        const filteredResult = result.Items.filter((items) => items.ID !== connectionID)[0];
        const { ID: otherConnectionId, domainName, stage } = filteredResult
        const { data } = body;

        await WebSocket.send({
            domainName,
            stage,
            connectionID: otherConnectionId,
            message: JSON.stringify({
                statusCode: 200,
                data
            }),
        });

        // {"message": "dsdsd", "action": "message"}
        // {"data": "{number: 6}", "action": "message"}

        return Responses._200({ message: 'got a message' });
    } catch (error) {
        console.log('message', error);
        return Responses._400({ message: 'message could not be received' });
    }
};
