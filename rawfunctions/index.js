import fetch from "node-fetch";
import querystring from "querystring";
import { getContent, upsertContent } from "./octokit";
import marked from "marked";

function getTime() {
  return new Promise((resolve) => {
    fetch("https://worldtimeapi.org/api/ip").then(
      (response) =>
        response.json().then((blob) => {
          //console.log(blob)
          resolve({ time: blob, error: null });
        }),
      (err) => {
        console.log(err);
        resolve({ time: blob, error: "json parse error" });
      },
      (err) => {
        console.log(err);
        resolve({ time: null, error: "fetch error" });
      }
    );
  });
}

function parseForm(data) {
  try {
    const json = querystring.parse(data);

    return json;
  } catch (err) {
    console.log("could not parse body as form");

    return data;
  }
}

exports.handler = async function (event, context, callback) {
  let blob = event.body;

  console.log("body", event.body);

  try {
    blob = JSON.parse(event.body);
  } catch (err) {
    console.log("could not parse body as json");

    blob = await parseForm(blob);
  }

  let upsertHtmlResult = null;
  let upsertLogoResult = null;

  const name = blob.name;
  const title = blob.title;
  const description = blob.description;
  let article = blob.article;
  const logoExt = blob.logoExt;

  const b64 = blob.fileBase64;

  let logometa = "";

  let logoUrl = null;

  const uid = Math.random().toString(36).substring(2, 12);

  if (b64.length > 0) {
    const logoName = `logo_${uid}.${logoExt}`;
    logoUrl = `sites/${logoName}`;
    logometa = `<meta property="og:image" content="https://discordlambda.netlify.app/${logoUrl}" />`;
  }

  const contentUrl = `sites/index_${uid}.html`;

  const siteUrl = `https://discordlambda.netlify.app/${contentUrl}`;

  if (blob.usemarkdown == "on") {
    article = marked(article);
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta property="og:type" content="object" />
    <meta property="og:site_name" content="${name}" />
    <meta property="og:url" content="${siteUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />    
    ${logometa}
    <!--<meta name="twitter:card" content="summary_large_image" />-->
    
    <title>${title}</title>
  </head>
  <body>
    ${article}
  </body>
</html>
`;

  const htmlB64 = Buffer.from(html).toString("base64");

  console.log("generated html", html);

  console.log(
    "uploading html",
    contentUrl,
    "length",
    html.length,
    "b64 length",
    htmlB64.length
  );

  upsertHtmlResult = await upsertContent(
    null,
    null,
    `site/${contentUrl}`,
    null,
    htmlB64,
    null,
    null,
    null,
    null
  );

  console.log("upsert html result", upsertHtmlResult);

  if (logoUrl) {
    upsertLogoResult = await upsertContent(
      null,
      null,
      `site/${logoUrl}`,
      null,
      b64,
      null,
      null,
      null,
      null
    );

    console.log("upsert logo result", upsertLogoResult);
  }

  const resultsJson = JSON.stringify(
    {
      message: "discordlambda",
      body: blob,
      upsertHtmlResult: upsertHtmlResult,
      upsertLogoResult: upsertLogoResult,
    },
    null,
    2
  );

  const responseHtml = `
<!DOCTYPE html>
<html lang="en">
  <head>
  	<title>Creating your site ...</title>

    <link rel="stylesheet" href="/app.css">

    <style>body {background: none;}</style>
    
    <title>${title}</title>
  </head>
  <body>
    <div class="redirect">
	You will be soon redirected to your site, please wait ...
	</div>

	<div class="redirect note">
	When redirected, copy the url of your page and paste it into a Discord channel.
	</div>

	<div class="redirect note">
	It should be rendered as a preview.
	</div>

	<hr>

	<pre class="result">${resultsJson}</pre>

	<script>
		setTimeout(_ => {
			document.location.href = "${siteUrl}"
		}, 30000)
	</script>
  </body>
</html>
`;

  return callback(null, {
    statusCode: 200,
    body: responseHtml,
    headers: {
      "Content-Type": "text/html",
    },
  });
};
