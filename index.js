const core = require('@actions/core');
const github = require('@actions/github');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  try {
    const githubToken = core.getInput('github_token', { required: true });
    const geminiApiKey = core.getInput('gemini_api_key', { required: true });
    const repoOwner = core.getInput('repo_owner', { required: true });
    const repoName = core.getInput('repo_name', { required: true });

    const octokit = github.getOctokit(githubToken);

    // 1. Fetch Issues
    core.info('Fetching issues...');
    const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
      owner: repoOwner,
      repo: repoName,
      state: 'all', // Get both open and closed
    });

    // 2. Fetch Pull Requests
    core.info('Fetching pull requests...');
    const prs = await octokit.paginate(octokit.rest.pulls.list, {
      owner: repoOwner,
      repo: repoName,
      state: 'all', // Get both open and closed
    });
    
    // For a more comprehensive summary, you would get more data on each PR,
    // like commits and diffs. The `pulls.list` endpoint doesn't return
    // this by default. You would need to loop through each PR and call
    // `octokit.rest.pulls.listCommits` and `octokit.rest.pulls.get`.

    // 3. Fetch recent commits to main branch
    core.info('Fetching recent commits to main...');
    const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
      owner: repoOwner,
      repo: repoName,
      sha: 'main', // Or your default branch name
      per_page: 50, // Limit to a reasonable number of recent commits
    });

    // 4. Construct the prompt for Gemini
    let prompt = `
      Please provide a summary and digest of the recent activity in a GitHub repository. 
      Analyze the following issues, pull requests, and commits to the main branch. 
      Focus on summarizing key themes, significant changes, and overall progress.

      ---
      ISSUES:
      ${issues.map(issue => `
        - #${issue.number}: ${issue.title}
          State: ${issue.state}
          Author: ${issue.user.login}
          Body: ${issue.body}
      `).join('\n')}

      ---
      PULL REQUESTS:
      ${prs.map(pr => `
        - #${pr.number}: ${pr.title}
          State: ${pr.state}
          Author: ${pr.user.login}
          Body: ${pr.body}
          URL: ${pr.html_url}
      `).join('\n')}

      ---
      COMMITS TO MAIN:
      ${commits.map(commit => `
        - ${commit.sha.substring(0, 7)}: ${commit.commit.message}
          Author: ${commit.commit.author.name}
      `).join('\n')}

      ---
      SUMMARY:
      (Provide a concise, easy-to-read summary of the above data. Structure it with clear headings for "Issues Summary", "Pull Requests Summary", and "Recent Main Branch Commits". Do not make up any information.)
    `;
    
    // 5. Send to Gemini API for summarization
    core.info('Sending data to Gemini for summarization...');
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    core.info('Summary received from Gemini.');
    core.info(summary);

    // 6. Post the summary as an issue or comment
    // Here, we'll create a new issue for the summary digest.
    core.info('Posting summary as a new issue...');
    await octokit.rest.issues.create({
      owner: repoOwner,
      repo: repoName,
      title: `Daily Repo Digest - ${new Date().toLocaleDateString()}`,
      body: summary,
    });

    core.info('Successfully created summary issue!');

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();