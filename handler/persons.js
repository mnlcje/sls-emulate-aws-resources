const AWS = require('aws-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');

const app = express();

const CONFIG_PERSONS_TABLE = process.env.CONFIG_PERSONS_TABLE;
const CONFIG_PERSONS_DYNAMODB_ENDPOINT = process.env.CONFIG_DYNAMODB_ENDPOINT;
/*
To find out whether we are in offline mode, the serverless offline plugin 
provides an environment variable which we can check: IS_OFFLINE. 
We can use this variable to build a switch, overriding the endpoint in local mode.
*/
const IS_OFFLINE = process.env.IS_OFFLINE;

let dynamoDb;

if(IS_OFFLINE === 'true'){
    dynamoDb = new AWS.DynamoDB.DocumentClient({
        region:'localhost',
        endpoint:CONFIG_PERSONS_DYNAMODB_ENDPOINT
    });
}
else
{
    dynamoDb = new AWS.dynamoDb.DocumentClient();
}

/*
Get Person list
*/
app.get('/persons', async function(req,res){

    const dbParams = {
        TableName:CONFIG_PERSONS_TABLE        
    };
    try{
        let result = await dynamoDb.scan(dbParams).promise();
        res.json({persons: result.Items});
    }
    catch(error){

        console.log(error);

    }
    });

/*
Create Person
*/
app.post('/persons', async function(req,res){

    const dbParams = {
        TableName: CONFIG_PERSONS_TABLE,
        Item:{
            personId: ''+new Date().getTime(),
            Name: 'Mainak'
        },
    };
    try {
        await dynamoDb.put(dbParams).promise();
        res.json({status:'200'});        
    } catch (error) {
        console.log(error);
        res.status(400).json({error:'Error in Creating Person'});       
    }
});

module.exports.handler = serverless(app);