import { Octokit } from 'https://cdn.skypack.dev/@octokit/core@4?dts'
import { restEndpointMethods } from 'https://cdn.skypack.dev/@octokit/plugin-rest-endpoint-methods@4?dts'

const GitHubToken = Deno.env.get('GITHUB_TOKEN')
if (!GitHubToken) {
  throw new Error('GITHUB_TOKEN is required.')
}

const MyOctokit = Octokit.plugin(restEndpointMethods)
const octokit = new MyOctokit({
  auth: GitHubToken,
  timeZone: 'Asia/Shanghai'
})

export default octokit
