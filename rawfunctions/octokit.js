 const { Octokit } = require("@octokit/rest")

 const defaultOwner = "hyperchessbot" || process.env.OCTOKIT_OWNER
 const defaultRepo = "discordlambda" || process.env.OCTOKIT_REPO
 const defaultCommiterName = "hyperchessbot" || process.env.OCTOKIT_COMMITER_NAME
 const defaultCommiterEmail = "hyperchessbot@gmail.com" || process.env.OCTOKIT_COMMITER_EMAIL
 const defaultAuthorName = commiterName || process.env.OCTOKIT_AUTHOR_NAME
 const defaultAuthorEmail = commiterEmail || process.env.OCTOKIT_AUTHOR_EMAIL

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

export function upsertContent(owner, repo, path, message, content, commiterName, commiterEmail, authorName, authorEmail){
	return octokit.repos.createOrUpdateFileContents({
        owner || defaultOwner,
		repo || defaultRepo,
		path,
		message || "Upload file",
		content,
		committer.name || defaultCommiterName,
		committer.email || defaultCommiterEmail,
		author.name || defaultAuthorName,
		author.email || defaultAuthorEmail
	})
}
