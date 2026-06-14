/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
const TOKEN = process.env.TOKEN
const CHAT_ID = process.env.CHAT_ID
const PROJECT_ID = process.env.PROJECT_ID
const Telegram = require('telegraf/telegram')
const tg = new Telegram(TOKEN)


const escapeString = (string) => {
    return string.replace(/[_*[\]()`]/g, '\\$&');
}

exports.messageparser = async (event, context) => {
    console.log(`event;`, event)

    let message = null

    try {
        if (event.incident) {
            message = event
        } else if (event.data && event.data.incident) {
            message = event.data
        } else if (event['@type'] === 'type.googleapis.com/google.pubsub.v1.PubsubMessage' && event.data != null) {
            message = JSON.parse(Buffer.from(event.data, 'base64').toString())
        } else if (event.body) {
            const body = event.body;
            if (body.incident) {
                message = body;
            } else if (body.message && body.message.data) {
                message = JSON.parse(Buffer.from(body.message.data, 'base64').toString());
            } else {
                message = body;
            }
        } else if (event.data && event.data.message && event.data.message.data) {
            message = JSON.parse(Buffer.from(event.data.message.data, 'base64').toString())
        } else if (event.message && event.message.data) {
            message = JSON.parse(Buffer.from(event.message.data, 'base64').toString())
        } else if (typeof event.data === 'string') {
            message = JSON.parse(Buffer.from(event.data, 'base64').toString())
        }
    } catch (e) {
        console.error(`Parsing error:`, e)
        if (context && typeof context.status === 'function') {
            context.status(400).send(`Parsing error: ${e.toString()}`);
        }
        return
    }


    console.log(`message; `, message)

    if (message == null) {
        if (context && typeof context.status === 'function') {
            context.status(200).send('Message is null');
        }
        return
    }

    const incident = message.incident || message




    let parts = []
    let emoji;
    if (incident.state === 'closed') {
        emoji = '✅';
    } else if (incident.severity === 'Critical') {
        emoji = '❗';
    } else if (incident.severity === 'Warning') {
        emoji = '⚠️';
    } else {
        emoji = 'ℹ️';
    }

    const subject = incident?.documentation?.subject ? incident.documentation.subject : `[${incident.state}] ${incident.policy_name}`
    const service = incident?.metric?.labels?.service ? incident.metric.labels.service : (incident?.resource?.labels?.container_name ? incident.resource.labels.container_name : null);

    parts.push(`${emoji} *${escapeString(subject)}*`)
    parts.push('\n\n');

    if (service) {
        parts.push(`Service: \`${service}\``);
    } else {
        parts.push(`Resource: \`${incident.resource_display_name}\``);
    }
    parts.push('\n\n');
    parts.push(incident?.documentation?.content ? incident.documentation.content : incident.summary);

    try {
        let buttons = [];
        buttons.push({ text: 'Incident', url: incident.url })
        if (service) {
            buttons.push({
                text: 'Logs',
                url: `https://console.cloud.google.com/logs/query;query=resource.labels.container_name%3D%22${service}%22;duration=P1D?project=${PROJECT_ID}`
            })
        }

        const response = await tg.sendMessage(
            CHAT_ID,
            parts.join(''),
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        buttons
                    ]
                }
            }
        )
        if (context && typeof context.status === 'function') {
            context.status(200).send('ok');
        }
        console.log(`sendMessage.success; `, response)
    } catch (e) {
        console.log(`sendMessage.error; `, e)
        if (context && typeof context.status === 'function' && !context.headersSent) {
            context.status(500).send(e.toString());
            return;
        }
    }

}

