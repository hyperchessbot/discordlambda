 const { Octokit } = require("@octokit/rest")

 const defaultOwner = "hyperchessbot" || process.env.OCTOKIT_OWNER
 const defaultRepo = "discordlambda" || process.env.OCTOKIT_REPO
 const defaultCommiterName = "hyperchessbot" || process.env.OCTOKIT_COMMITER_NAME
 const defaultCommiterEmail = "hyperchessbot@gmail.com" || process.env.OCTOKIT_COMMITER_EMAIL
 const defaultAuthorName = defaultCommiterName || process.env.OCTOKIT_AUTHOR_NAME
 const defaultAuthorEmail = defaultCommiterEmail || process.env.OCTOKIT_AUTHOR_EMAIL

 const octokit = new Octokit({
 	auth: process.env.OCTOKIT_PUSH_TOKEN,
 	userAgent: "discordlambda",
 	baseUrl: "https://api.github.com"
 })

export function getRepo(owner, repo){
	return octokit.repos.get({
		repo: defaultRepo,
		owner: defaultOwner
	})
}

export function getContent(owner, repo, path){
	return octokit.repos.getContent({
		repo: defaultRepo,
		owner: defaultOwner,
		path: path
	})
}

export async function upsertContent(owner, repo, path, message, content, commiterName, commiterEmail, authorName, authorEmail){
	console.log("getting sha for", path)

	let sha = undefined

	try {
		let content = await getContent(null, null, path)
		sha = content.data.sha
	}catch(err){}

	console.log("received sha", sha)

	return octokit.repos.createOrUpdateFileContents({
        owner: owner || defaultOwner,
		repo: repo || defaultRepo,
		path,
		message: message || "Upload file",
		content,
		"committer.name": commiterName || defaultCommiterName,
		"committer.email": commiterEmail || defaultCommiterEmail,
		"author.name": authorName || defaultAuthorName,
		"author.email": authorEmail || defaultAuthorEmail,
		sha: sha
	})
}
