import fetch from 'node-fetch'
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

exports.handler = async function(event, context, callback) {
	let blob = event.body

	console.log("body", event.body)

	try{
		blob = JSON.parse(event.body)
	}catch(err){
		console.log("could not parse body as json")
	}

	let time = await getTime()

	console.log("getting content")

	let sha = null

	try {
		let content = await getContent(null, null, "package.json")
		sha = content.data.sha
	}catch(err){}

	console.log("upserting content")

	let upsertResult = await upsertContent(null, null, "sites/test.html", null, Buffer.from("just a test").toString('base64'), null, null, null, null)

	console.log("upsert result", upsertResult)

    return callback(null, {
        statusCode: 200,
        body: "<pre>" + JSON.stringify({
        	message: "discordlambda",
        	body: blob,
        	fetchedTime: time,
        	sha: sha
        }, null, 2) + "</pre>",
        headers: {
        	"Content-Type": "text/html"
        }
    });
}
