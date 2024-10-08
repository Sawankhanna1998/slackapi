const express = require('express');
const bodyparser = require('body-parser');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.status(200).send("hello");
})
app.post('/request_asset', async (req, res) => {
    const {text, user_id} = req.body;
    const formBlocks = [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Please fill out the asset request form:',
            },
        },
        {
            type: 'input',
            block_id: 'asset_type',
            label: {
                type: 'plain_text',
                text: 'Asset Type',
            },
            element: {
                type: 'plain_text_input',
                action_id: 'type',
            },
        },
        {
            type: 'input',
            block_id: 'asset_quantity',
            label: {
                type: 'plain_text',
                text: 'Quantity',
            },
            element: {
                type: 'plain_text_input',
                action_id: 'quantity',
                multiline: false,
            },
        },
        {
            type: 'input',
            block_id: 'justification',
            label: {
                type: 'plain_text',
                text: 'Justification for Request',
            },
            element: {
                type: 'plain_text_input',
                action_id: 'justification',
                multiline: true,
            },
        },
        {
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: {
                        type: 'plain_text',
                        text: 'Submit Request',
                    },
                    value: 'submit_request',
                    action_id: 'submit_button',
                },
            ],
        },
    ];
    
    await sendSlackMessage(user_id, '', formBlocks);
    res.status(200).send();
});

const sendSlackMessage = async (userId, message) => {
    await axios.post('https://slack.com/api/chat.postMessage', {
        channel: userId,
        text: message,
    }, {
        headers: {
            'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });
};

app.post('/submit_asset_request', async (req, res) => {
    const { payload } = req.body; // Extract the payload
    const data = JSON.parse(payload);

    const { user, actions } = data;

    const assetType = actions.find(a => a.block_id === 'asset_type').value;
    const assetQuantity = actions.find(a => a.block_id === 'asset_quantity').value;
    const justification = actions.find(a => a.block_id === 'justification').value;

    // Process the request (e.g., save to database, notify admin)
    const responseMessage = `Asset Request Submitted:\n*Type:* ${assetType}\n*Quantity:* ${assetQuantity}\n*Justification:* ${justification}`;
    
    await sendSlackMessage(user.id, responseMessage);
    res.status(200).send();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})