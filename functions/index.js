exports.handler = async function(event, context, callback) {
	let blob = event.body

	try{
		blob = JSON.parse(event.body)
	}catch(err){
		console.log("could not parse body as json")
	}
	
    return callback(null, {
        statusCode: 200,
        body: "<pre>" + JSON.stringify({message: "Hello World", body: blob}, null, 2) + "</pre>",
        headers: {
        	"Content-Type": "text/html"
        }
    });
}
