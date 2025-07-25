import * as core from '@actions/core';
import * as github from '@actions/github';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
      per_page: 100, // Fetch up to 100 issues
    });

    // 2. Fetch Pull Requests and their diffs
    core.info('Fetching pull requests and their diffs...');
    const prs = await octokit.paginate(octokit.rest.pulls.list, {
      owner: repoOwner,
      repo: repoName,
      state: 'all', // Get both open and closed
      per_page: 50, // Limit to a reasonable number of PRs to fetch diffs for
    });

    const prsWithDiffs: Array<{ diff?: string } & typeof prs[0]> = [];
    for (const pr of prs) {
      try {
        // Fetch the full PR details including the diff
        const prDetails = await octokit.rest.pulls.get({
          owner: repoOwner,
          repo: repoName,
          pull_number: pr.number,
          mediaType: {
            format: 'diff' // Request the diff format
          }
        });
        // The diff content is directly in prDetails.data
        prsWithDiffs.push({
          ...pr,
          diff: prDetails.data.toString() // Convert the diff content to a string
        });
        core.info(`Fetched diff for PR #${pr.number}`);
      } catch (prError) {
        core.warning(`Could not fetch diff for PR #${pr.number}: ${prError.message}`);
        prsWithDiffs.push(pr); // Add PR without diff if fetching fails
      }
    }

    // 3. Fetch recent commits to main branch and their diffs
    core.info('Fetching recent commits to main and their diffs...');
    const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
      owner: repoOwner,
      repo: repoName,
      sha: 'main', // Or your default branch name
      per_page: 30, // Limit to a reasonable number of recent commits to fetch diffs for
    });

    const commitsWithDiffs: Array<{ diff?: string } & typeof commits[0]> = [];
    for (const commit of commits) {
      try {
        // Fetch the full commit details including the diff
        const commitDetails = await octokit.rest.repos.getCommit({
          owner: repoOwner,
          repo: repoName,
          ref: commit.sha,
          mediaType: {
            format: 'diff' // Request the diff format
          }
        });
        // The diff content is directly in commitDetails.data
        commitsWithDiffs.push({
          ...commit,
          diff: commitDetails.data.files?.map(file => file.patch).join('\n') || '' // Extract the diff content from files and concatenate
        });
        core.info(`Fetched diff for commit ${commit.sha.substring(0, 7)}`);
      } catch (commitError) {
        core.warning(`Could not fetch diff for commit ${commit.sha.substring(0, 7)}: ${commitError.message}`);
        commitsWithDiffs.push(commit); // Add commit without diff if fetching fails
      }
    }

    // 4. Construct the prompt for Gemini
    let prompt = `
      Please provide a comprehensive summary and digest of the recent activity in a GitHub repository.
      Analyze the following issues, pull requests (including their diffs), and commits to the main branch (including their diffs).
      Focus on summarizing key themes, significant changes, and overall progress.
      Highlight important issues, major features or fixes from pull requests, and the nature of changes in recent main branch commits.

      ---
      ISSUES:
      ${issues.map(issue => `
        - #${issue.number}: ${issue.title}
          State: ${issue.state}
          Author: ${issue.user ? issue.user.login : 'Unknown'}
          Body: ${issue.body ? issue.body.substring(0, 500) + (issue.body.length > 500 ? '...' : '') : 'No description'}
      `).join('\n')}

      ---
      PULL REQUESTS:
      ${prsWithDiffs.map(pr => `
        - #${pr.number}: ${pr.title}
          State: ${pr.state}
          Author: ${pr.user ? pr.user.login : 'Unknown'}
          Body: ${pr.body ? pr.body.substring(0, 500) + (pr.body.length > 500 ? '...' : '') : 'No description'}
          URL: ${pr.html_url}
          ${pr.diff ? `Diff:\n\`\`\`diff\n${pr.diff.substring(0, 2000) + (pr.diff.length > 2000 ? '...' : '')}\n\`\`\`` : 'No diff available.'}
      `).join('\n')}

      ---
      COMMITS TO MAIN BRANCH:
      ${commitsWithDiffs.map(commit => `
        - ${commit.sha.substring(0, 7)}: ${commit.commit.message}
          Author: ${commit.commit.author ? commit.commit.author.name : 'Unknown'}
          Date: ${commit.commit.author ? commit.commit.author.date : 'Unknown'}
          ${commit.diff ? `Diff:\n\`\`\`diff\n${commit.diff.substring(0, 1000) + (commit.diff.length > 1000 ? '...' : '')}\n\`\`\`` : 'No diff available.'}
      `).join('\n')}

      ---
      SUMMARY:
      (Provide a concise, easy-to-read summary of the above data. Structure it with clear headings for "Issues Summary", "Pull Requests Summary", and "Recent Main Branch Commits". Focus on the essence of the changes and discussions. Do not make up any information.)
    `;

    // 5. Send to Gemini API for summarization
    core.info('Sending data to Gemini for summarization...');
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    core.info('Summary received from Gemini.');
    core.info(summary);

    // 6. Post summary as a new discussion
    core.info('Posting summary as a new discussion...');
    const discussionTitle = `Repo Digest - ${new Date().toLocaleDateString()} for ${repoOwner}/${repoName}`;
    
    try {
      // First, fetch available discussion categories
      core.info('Fetching discussion categories...');
      const categoriesResponse = await octokit.request('GET /repos/{owner}/{repo}/discussions/categories', {
        owner: repoOwner,
        repo: repoName,
      });
      
      if (categoriesResponse.data.length === 0) {
        throw new Error('No discussion categories found. Please enable GitHub Discussions and create at least one category.');
      }
      
      // Use the first available category (typically "General")
      const categoryId = categoriesResponse.data[0].id;
      core.info(`Using discussion category: ${categoriesResponse.data[0].name} (ID: ${categoryId})`);
      
      // Create the discussion with the required category_id
      const discussionResponse = await octokit.request('POST /repos/{owner}/{repo}/discussions', {
        owner: repoOwner,
        repo: repoName,
        title: discussionTitle,
        body: summary,
        category_id: categoryId,
      });

      core.info(`Successfully created summary discussion! URL: ${discussionResponse.data.html_url}`);
      
    } catch (discussionError) {
      core.warning(`Failed to create discussion: ${discussionError.message}`);
      core.info('Discussion creation failed, but summary was successfully generated.');
      core.info('Make sure GitHub Discussions are enabled for this repository and the token has discussions:write permission.');
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
