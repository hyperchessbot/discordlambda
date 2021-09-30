'use strict';

var index = require('./index-ecbec8b9.js');
require('stream');
require('http');
require('url');
require('https');
require('zlib');

exports.handler = async function (event, context, callback) {  
  const url = event.queryStringParameters.url;    
  const response = await index.fetch(url);
  const content = await response.text();

  const body = `fetched ${url}, got ${content}`;

  return callback(null, {
    statusCode: 200,
    body: body,
    headers: {
      "Content-Type": "text/html",
    },
  });
};
