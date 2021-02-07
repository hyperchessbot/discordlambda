import fetch from 'node-fetch'
import querystring from 'querystring'
import { getContent, upsertContent } from './octokit'

function getTime(){
	return new Promise(resolve => {
		fetch("https://worldtimeapi.org/api/ip").then(
			response => response.json().then(
				blob => {
					//console.log(blob)
					resolve({time: blob, error: null})
				}
			),
			err => {
				console.log(err)
				resolve({time: blob, error: "json parse error"})
			},
			err => {
				console.log(err)
				resolve({time: null, error: "fetch error"})			
			}
		)
	})
}

function parseForm(data){
	try {
		const json = querystring.parse(data)

		return json
	}catch(err){
		console.log("could not parse body as form")

		return data
	}
}

exports.handler = async function(event, context, callback) {
	let blob = event.body

	console.log("body", event.body)

	try{
		blob = JSON.parse(event.body)
	}catch(err){
		console.log("could not parse body as json")

		blob = await parseForm(blob)
	}

	let upsertResult = null

	/*if(blob.filebase64){
		console.log("uploading file")

		upsertResult = await upsertContent(null, null, "sites/horsey.jpg", null, blob.filebase64, null, null, null, null)

		console.log("upsert result", upsertResult)
	}*/

    return callback(null, {
        statusCode: 200,
        body: "<pre>" + JSON.stringify({
        	message: "discordlambda",
        	body: blob,
        	upsertResult: upsertResult,
        }, null, 2) + "</pre>",
        headers: {
        	"Content-Type": "text/html"
        }
    });
}
