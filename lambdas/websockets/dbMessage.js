const Responses = require('../common/API_Responses');
const Dynamo = require('../common/Dynamo');
const WebSocket = require('../common/websocketMessage');
const tableName = process.env.tableName;

exports.handler = async event => {
    const eventData = event.Records[0];
    try {
        if (eventData.eventName === 'INSERT') {
            const { NewImage: { ID, domainName, stage } } = eventData.dynamodb;
            const data = {
                domainName: domainName.S,
                stage: stage.S,
                connectionID: ID.S
            }



            const result = await Dynamo.scan(tableName);
            if (result.Items.length < 2) {
                await WebSocket.send({
                    ...data, message:
                    JSON.stringify({
                        statusCode: 412,
                        data: {
                            error: 'waiting for the other player to connect.'
                        },
                    })
                });
            } else if (result.Items.length > 2) {
                await WebSocket.send({
                    ...data, message: JSON.stringify({
                        statusCode: 412,
                        data: {
                            error: `too many players connected. ${result.Items.length}`
                        }
                    })
                });
            } else {
                // send the data to the other connection too
                const filteredResult = result.Items.filter((items) => items.ID !== data.connectionID)[0];
                const { ID: otherConnectionID} = filteredResult;
                await WebSocket.send({
                    ...data,
                    connectionID: otherConnectionID,
                    message: JSON.stringify({
                        statusCode: 200,
                        data: {
                            connectionID: otherConnectionID,
                            otherConnectionID: ID.S,
                            isBothPlayers: true
                        }
                    })
                });

                await WebSocket.send({
                    ...data, message: JSON.stringify({
                        statusCode: 200,
                        data: {
                            connectionID: ID.S,
                            otherConnectionID,
                            isBothPlayers: true
                        }
                    })
                });
            }
        }
    } catch (e) {
        console.error('failure to send data', e);
    }
}
