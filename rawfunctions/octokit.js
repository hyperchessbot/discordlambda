 const { Octokit } = require("@octokit/rest")

 const defaultOwner = "hyperchessbot" || process.env.OCTOKIT_OWNER
 const defaultRepo = "discordlambda" || process.env.OCTOKIT_REPO

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
