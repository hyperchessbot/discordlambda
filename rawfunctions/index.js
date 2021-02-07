import fetch from 'node-fetch'

function getTime(){
	return new Promise(resolve => {
		fetch("https://worldtimeapi.org/api/ip").then(
			response => response.json().then(
				blob => {
					console.log(blob)
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

	try{
		blob = JSON.parse(event.body)
	}catch(err){
		console.log("could not parse body as json")
	}

	let time = await getTime()
	
    return callback(null, {
        statusCode: 200,
        body: "<pre>" + JSON.stringify({message: "discordlambda", body: blob, fetchedTime: time}, null, 2) + "</pre>",
        headers: {
        	"Content-Type": "text/html"
        }
    });
}
