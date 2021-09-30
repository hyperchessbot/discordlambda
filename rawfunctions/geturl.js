import fetch from "node-fetch";

exports.handler = async function (event, context, callback) {  
  const url = event.queryStringParameters.url    
  const response = await fetch(url)
  const content = await response.text()

  const body = `fetched ${url}, got ${content}`

  return callback(null, {
    statusCode: 200,
    body: body,
    headers: {
      "Content-Type": "text/html",
    },
  });
};
