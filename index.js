"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var github = require("@actions/github");
var generative_ai_1 = require("@google/generative-ai");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var githubToken, geminiApiKey, repoOwner, repoName, octokit, issues, prs, prsWithDiffs, _i, prs_1, pr, prDetails, prError_1, commits, commitsWithDiffs, _a, commits_1, commit, commitDetails, commitError_1, prompt_1, genAI, model, result, summary, discussionTitle, categoriesResponse, categoryId, discussionResponse, discussionError_1, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 22, , 23]);
                    githubToken = core.getInput('github_token', { required: true });
                    geminiApiKey = core.getInput('gemini_api_key', { required: true });
                    repoOwner = core.getInput('repo_owner', { required: true });
                    repoName = core.getInput('repo_name', { required: true });
                    octokit = github.getOctokit(githubToken);
                    // 1. Fetch Issues
                    core.info('Fetching issues...');
                    return [4 /*yield*/, octokit.paginate(octokit.rest.issues.listForRepo, {
                            owner: repoOwner,
                            repo: repoName,
                            state: 'all', // Get both open and closed
                            per_page: 100, // Fetch up to 100 issues
                        })];
                case 1:
                    issues = _c.sent();
                    // 2. Fetch Pull Requests and their diffs
                    core.info('Fetching pull requests and their diffs...');
                    return [4 /*yield*/, octokit.paginate(octokit.rest.pulls.list, {
                            owner: repoOwner,
                            repo: repoName,
                            state: 'all', // Get both open and closed
                            per_page: 50, // Limit to a reasonable number of PRs to fetch diffs for
                        })];
                case 2:
                    prs = _c.sent();
                    prsWithDiffs = [];
                    _i = 0, prs_1 = prs;
                    _c.label = 3;
                case 3:
                    if (!(_i < prs_1.length)) return [3 /*break*/, 8];
                    pr = prs_1[_i];
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, octokit.rest.pulls.get({
                            owner: repoOwner,
                            repo: repoName,
                            pull_number: pr.number,
                            mediaType: {
                                format: 'diff' // Request the diff format
                            }
                        })];
                case 5:
                    prDetails = _c.sent();
                    // The diff content is directly in prDetails.data
                    prsWithDiffs.push(__assign(__assign({}, pr), { diff: prDetails.data.toString() // Convert the diff content to a string
                     }));
                    core.info("Fetched diff for PR #".concat(pr.number));
                    return [3 /*break*/, 7];
                case 6:
                    prError_1 = _c.sent();
                    core.warning("Could not fetch diff for PR #".concat(pr.number, ": ").concat(prError_1.message));
                    prsWithDiffs.push(pr); // Add PR without diff if fetching fails
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8:
                    // 3. Fetch recent commits to main branch and their diffs
                    core.info('Fetching recent commits to main and their diffs...');
                    return [4 /*yield*/, octokit.paginate(octokit.rest.repos.listCommits, {
                            owner: repoOwner,
                            repo: repoName,
                            sha: 'main', // Or your default branch name
                            per_page: 30, // Limit to a reasonable number of recent commits to fetch diffs for
                        })];
                case 9:
                    commits = _c.sent();
                    commitsWithDiffs = [];
                    _a = 0, commits_1 = commits;
                    _c.label = 10;
                case 10:
                    if (!(_a < commits_1.length)) return [3 /*break*/, 15];
                    commit = commits_1[_a];
                    _c.label = 11;
                case 11:
                    _c.trys.push([11, 13, , 14]);
                    return [4 /*yield*/, octokit.rest.repos.getCommit({
                            owner: repoOwner,
                            repo: repoName,
                            ref: commit.sha,
                            mediaType: {
                                format: 'diff' // Request the diff format
                            }
                        })];
                case 12:
                    commitDetails = _c.sent();
                    // The diff content is directly in commitDetails.data
                    commitsWithDiffs.push(__assign(__assign({}, commit), { diff: ((_b = commitDetails.data.files) === null || _b === void 0 ? void 0 : _b.map(function (file) { return file.patch; }).join('\n')) || '' // Extract the diff content from files and concatenate
                     }));
                    core.info("Fetched diff for commit ".concat(commit.sha.substring(0, 7)));
                    return [3 /*break*/, 14];
                case 13:
                    commitError_1 = _c.sent();
                    core.warning("Could not fetch diff for commit ".concat(commit.sha.substring(0, 7), ": ").concat(commitError_1.message));
                    commitsWithDiffs.push(commit); // Add commit without diff if fetching fails
                    return [3 /*break*/, 14];
                case 14:
                    _a++;
                    return [3 /*break*/, 10];
                case 15:
                    prompt_1 = "\n      Please provide a comprehensive summary and digest of the recent activity in a GitHub repository.\n      Analyze the following issues, pull requests (including their diffs), and commits to the main branch (including their diffs).\n      Focus on summarizing key themes, significant changes, and overall progress.\n      Highlight important issues, major features or fixes from pull requests, and the nature of changes in recent main branch commits.\n\n      ---\n      ISSUES:\n      ".concat(issues.map(function (issue) { return "\n        - #".concat(issue.number, ": ").concat(issue.title, "\n          State: ").concat(issue.state, "\n          Author: ").concat(issue.user ? issue.user.login : 'Unknown', "\n          Body: ").concat(issue.body ? issue.body.substring(0, 500) + (issue.body.length > 500 ? '...' : '') : 'No description', "\n      "); }).join('\n'), "\n\n      ---\n      PULL REQUESTS:\n      ").concat(prsWithDiffs.map(function (pr) { return "\n        - #".concat(pr.number, ": ").concat(pr.title, "\n          State: ").concat(pr.state, "\n          Author: ").concat(pr.user ? pr.user.login : 'Unknown', "\n          Body: ").concat(pr.body ? pr.body.substring(0, 500) + (pr.body.length > 500 ? '...' : '') : 'No description', "\n          URL: ").concat(pr.html_url, "\n          ").concat(pr.diff ? "Diff:\n```diff\n".concat(pr.diff.substring(0, 2000) + (pr.diff.length > 2000 ? '...' : ''), "\n```") : 'No diff available.', "\n      "); }).join('\n'), "\n\n      ---\n      COMMITS TO MAIN BRANCH:\n      ").concat(commitsWithDiffs.map(function (commit) { return "\n        - ".concat(commit.sha.substring(0, 7), ": ").concat(commit.commit.message, "\n          Author: ").concat(commit.commit.author ? commit.commit.author.name : 'Unknown', "\n          Date: ").concat(commit.commit.author ? commit.commit.author.date : 'Unknown', "\n          ").concat(commit.diff ? "Diff:\n```diff\n".concat(commit.diff.substring(0, 1000) + (commit.diff.length > 1000 ? '...' : ''), "\n```") : 'No diff available.', "\n      "); }).join('\n'), "\n\n      ---\n      SUMMARY:\n      (Provide a concise, easy-to-read summary of the above data. Structure it with clear headings for \"Issues Summary\", \"Pull Requests Summary\", and \"Recent Main Branch Commits\". Focus on the essence of the changes and discussions. Do not make up any information.)\n    ");
                    // 5. Send to Gemini API for summarization
                    core.info('Sending data to Gemini for summarization...');
                    genAI = new generative_ai_1.GoogleGenerativeAI(geminiApiKey);
                    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
                    return [4 /*yield*/, model.generateContent(prompt_1)];
                case 16:
                    result = _c.sent();
                    summary = result.response.text();
                    core.info('Summary received from Gemini.');
                    core.info(summary);
                    // 6. Post summary as a new discussion
                    core.info('Posting summary as a new discussion...');
                    discussionTitle = "Repo Digest - ".concat(new Date().toLocaleDateString(), " for ").concat(repoOwner, "/").concat(repoName);
                    _c.label = 17;
                case 17:
                    _c.trys.push([17, 20, , 21]);
                    // First, fetch available discussion categories
                    core.info('Fetching discussion categories...');
                    return [4 /*yield*/, octokit.request('GET /repos/{owner}/{repo}/discussions/categories', {
                            owner: repoOwner,
                            repo: repoName,
                        })];
                case 18:
                    categoriesResponse = _c.sent();
                    if (categoriesResponse.data.length === 0) {
                        throw new Error('No discussion categories found. Please enable GitHub Discussions and create at least one category.');
                    }
                    categoryId = categoriesResponse.data[0].id;
                    core.info("Using discussion category: ".concat(categoriesResponse.data[0].name, " (ID: ").concat(categoryId, ")"));
                    return [4 /*yield*/, octokit.request('POST /repos/{owner}/{repo}/discussions', {
                            owner: repoOwner,
                            repo: repoName,
                            title: discussionTitle,
                            body: summary,
                            category_id: categoryId,
                        })];
                case 19:
                    discussionResponse = _c.sent();
                    core.info("Successfully created summary discussion! URL: ".concat(discussionResponse.data.html_url));
                    return [3 /*break*/, 21];
                case 20:
                    discussionError_1 = _c.sent();
                    core.warning("Failed to create discussion: ".concat(discussionError_1.message));
                    core.info('Discussion creation failed, but summary was successfully generated.');
                    core.info('Make sure GitHub Discussions are enabled for this repository and the token has discussions:write permission.');
                    return [3 /*break*/, 21];
                case 21: return [3 /*break*/, 23];
                case 22:
                    error_1 = _c.sent();
                    core.setFailed(error_1.message);
                    return [3 /*break*/, 23];
                case 23: return [2 /*return*/];
            }
        });
    });
}
run();
