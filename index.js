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
var nodemailer = require("nodemailer");
function getContributorEmails(octokit, repoOwner, repoName) {
    return __awaiter(this, void 0, void 0, function () {
        var contributors, contributorEmails, _i, contributors_1, contributor, userDetails, contributorInfo, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    core.info('Fetching repository contributors...');
                    return [4 /*yield*/, octokit.paginate(octokit.rest.repos.listContributors, {
                            owner: repoOwner,
                            repo: repoName,
                            per_page: 50
                        })];
                case 1:
                    contributors = _a.sent();
                    contributorEmails = [];
                    _i = 0, contributors_1 = contributors;
                    _a.label = 2;
                case 2:
                    if (!(_i < contributors_1.length)) return [3 /*break*/, 7];
                    contributor = contributors_1[_i];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, octokit.rest.users.getByUsername({
                            username: contributor.login
                        })];
                case 4:
                    userDetails = _a.sent();
                    contributorInfo = {
                        login: contributor.login,
                        name: userDetails.data.name || contributor.login
                    };
                    // Only include if they have a public email
                    if (userDetails.data.email) {
                        contributorInfo.email = userDetails.data.email;
                        contributorEmails.push(contributorInfo);
                        core.info("Found email for contributor: ".concat(contributor.login));
                    }
                    else {
                        core.info("No public email found for contributor: ".concat(contributor.login));
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    core.warning("Could not fetch details for contributor ".concat(contributor.login, ": ").concat(error_1.message));
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    core.info("Found ".concat(contributorEmails.length, " contributors with public emails"));
                    return [2 /*return*/, contributorEmails];
                case 8:
                    error_2 = _a.sent();
                    core.warning("Could not fetch contributors: ".concat(error_2.message));
                    return [2 /*return*/, []];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function sendEmailDigest(summary, contributors, repoOwner, repoName) {
    return __awaiter(this, void 0, void 0, function () {
        var emailEnabled, smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail, fromName, transporter_1, subject_1, htmlContent, emailBody_1, emailPromises, error_3;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    emailEnabled = core.getInput('email_enabled').toLowerCase() === 'true';
                    if (!emailEnabled) {
                        core.info('Email sending is disabled');
                        return [2 /*return*/];
                    }
                    smtpHost = core.getInput('smtp_host');
                    smtpPort = parseInt(core.getInput('smtp_port') || '587');
                    smtpUser = core.getInput('smtp_user');
                    smtpPassword = core.getInput('smtp_password');
                    fromEmail = core.getInput('from_email');
                    fromName = core.getInput('from_name') || 'Repository Digest Bot';
                    if (!smtpHost || !smtpUser || !smtpPassword || !fromEmail) {
                        core.warning('Email sending is enabled but SMTP configuration is incomplete. Skipping email.');
                        return [2 /*return*/];
                    }
                    if (contributors.length === 0) {
                        core.warning('No contributors with public emails found. Skipping email.');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    core.info('Setting up email transporter...');
                    transporter_1 = nodemailer.createTransport({
                        host: smtpHost,
                        port: smtpPort,
                        secure: smtpPort === 465, // true for 465, false for other ports
                        auth: {
                            user: smtpUser,
                            pass: smtpPassword
                        }
                    });
                    // Verify connection
                    return [4 /*yield*/, transporter_1.verify()];
                case 2:
                    // Verify connection
                    _a.sent();
                    core.info('SMTP connection verified successfully');
                    subject_1 = "\uD83D\uDCCA Weekly Digest for ".concat(repoOwner, "/").concat(repoName, " - ").concat(new Date().toLocaleDateString());
                    htmlContent = summary
                        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/`(.*?)`/g, '<code>$1</code>')
                        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                        .replace(/\n/g, '<br>');
                    emailBody_1 = "\n      <html>\n        <head>\n          <style>\n            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }\n            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }\n            h2 { color: #34495e; margin-top: 30px; }\n            h3 { color: #7f8c8d; }\n            code { background-color: #f4f4f4; padding: 2px 4px; border-radius: 3px; }\n            pre { background-color: #f8f8f8; padding: 10px; border-radius: 5px; overflow-x: auto; }\n            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }\n          </style>\n        </head>\n        <body>\n          ".concat(htmlContent, "\n          <div class=\"footer\">\n            <p>This digest was automatically generated by the ").concat(repoOwner, "/").concat(repoName, " repository's weekly recap action.</p>\n            <p>To stop receiving these emails, contact the repository maintainers.</p>\n          </div>\n        </body>\n      </html>\n    ");
                    emailPromises = contributors.filter(function (c) { return c.email; }).map(function (contributor) { return __awaiter(_this, void 0, void 0, function () {
                        var emailError_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, transporter_1.sendMail({
                                            from: "\"".concat(fromName, "\" <").concat(fromEmail, ">"),
                                            to: contributor.email,
                                            subject: subject_1,
                                            html: emailBody_1,
                                            text: summary // Plain text fallback
                                        })];
                                case 1:
                                    _a.sent();
                                    core.info("Email sent successfully to ".concat(contributor.login, " (").concat(contributor.email, ")"));
                                    return [3 /*break*/, 3];
                                case 2:
                                    emailError_1 = _a.sent();
                                    core.warning("Failed to send email to ".concat(contributor.login, ": ").concat(emailError_1.message));
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(emailPromises)];
                case 3:
                    _a.sent();
                    core.info("Attempted to send ".concat(emailPromises.length, " emails to contributors"));
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    core.warning("Email sending failed: ".concat(error_3.message));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var githubToken, geminiApiKey, repoOwner, repoName, octokit, contributors, issues, prs, prsWithDiffs, _i, prs_1, pr, prDetails, prError_1, commits, commitsWithDiffs, _a, commits_1, commit, commitDetails, commitError_1, prompt_1, genAI, model, result, summary, discussionTitle, categoriesResponse, categoryId, discussionResponse, discussionError_1, error_4;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 24, , 25]);
                    githubToken = core.getInput('github_token', { required: true });
                    geminiApiKey = core.getInput('gemini_api_key', { required: true });
                    repoOwner = core.getInput('repo_owner', { required: true });
                    repoName = core.getInput('repo_name', { required: true });
                    octokit = github.getOctokit(githubToken);
                    return [4 /*yield*/, getContributorEmails(octokit, repoOwner, repoName)];
                case 1:
                    contributors = _c.sent();
                    // 1. Fetch Issues
                    core.info('Fetching issues...');
                    return [4 /*yield*/, octokit.paginate(octokit.rest.issues.listForRepo, {
                            owner: repoOwner,
                            repo: repoName,
                            state: 'all', // Get both open and closed
                            per_page: 100, // Fetch up to 100 issues
                        })];
                case 2:
                    issues = _c.sent();
                    // 2. Fetch Pull Requests and their diffs
                    core.info('Fetching pull requests and their diffs...');
                    return [4 /*yield*/, octokit.paginate(octokit.rest.pulls.list, {
                            owner: repoOwner,
                            repo: repoName,
                            state: 'all', // Get both open and closed
                            per_page: 50, // Limit to a reasonable number of PRs to fetch diffs for
                        })];
                case 3:
                    prs = _c.sent();
                    prsWithDiffs = [];
                    _i = 0, prs_1 = prs;
                    _c.label = 4;
                case 4:
                    if (!(_i < prs_1.length)) return [3 /*break*/, 9];
                    pr = prs_1[_i];
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, octokit.rest.pulls.get({
                            owner: repoOwner,
                            repo: repoName,
                            pull_number: pr.number,
                            mediaType: {
                                format: 'diff' // Request the diff format
                            }
                        })];
                case 6:
                    prDetails = _c.sent();
                    // The diff content is directly in prDetails.data
                    prsWithDiffs.push(__assign(__assign({}, pr), { diff: prDetails.data.toString() // Convert the diff content to a string
                     }));
                    core.info("Fetched diff for PR #".concat(pr.number));
                    return [3 /*break*/, 8];
                case 7:
                    prError_1 = _c.sent();
                    core.warning("Could not fetch diff for PR #".concat(pr.number, ": ").concat(prError_1.message));
                    prsWithDiffs.push(pr); // Add PR without diff if fetching fails
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9:
                    // 3. Fetch recent commits to main branch and their diffs
                    core.info('Fetching recent commits to main and their diffs...');
                    return [4 /*yield*/, octokit.paginate(octokit.rest.repos.listCommits, {
                            owner: repoOwner,
                            repo: repoName,
                            sha: 'main', // Or your default branch name
                            per_page: 30, // Limit to a reasonable number of recent commits to fetch diffs for
                        })];
                case 10:
                    commits = _c.sent();
                    commitsWithDiffs = [];
                    _a = 0, commits_1 = commits;
                    _c.label = 11;
                case 11:
                    if (!(_a < commits_1.length)) return [3 /*break*/, 16];
                    commit = commits_1[_a];
                    _c.label = 12;
                case 12:
                    _c.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, octokit.rest.repos.getCommit({
                            owner: repoOwner,
                            repo: repoName,
                            ref: commit.sha,
                            mediaType: {
                                format: 'diff' // Request the diff format
                            }
                        })];
                case 13:
                    commitDetails = _c.sent();
                    // The diff content is directly in commitDetails.data
                    commitsWithDiffs.push(__assign(__assign({}, commit), { diff: ((_b = commitDetails.data.files) === null || _b === void 0 ? void 0 : _b.map(function (file) { return file.patch; }).join('\n')) || '' // Extract the diff content from files and concatenate
                     }));
                    core.info("Fetched diff for commit ".concat(commit.sha.substring(0, 7)));
                    return [3 /*break*/, 15];
                case 14:
                    commitError_1 = _c.sent();
                    core.warning("Could not fetch diff for commit ".concat(commit.sha.substring(0, 7), ": ").concat(commitError_1.message));
                    commitsWithDiffs.push(commit); // Add commit without diff if fetching fails
                    return [3 /*break*/, 15];
                case 15:
                    _a++;
                    return [3 /*break*/, 11];
                case 16:
                    prompt_1 = "\n      You are a technical project manager creating a weekly digest for repository contributors and stakeholders.\n      \n      Analyze the following GitHub repository activity and create a comprehensive, well-structured digest that will be shared with the development team via email and discussions.\n      \n      **Instructions:**\n      1. Provide actionable insights and highlight items that need attention\n      2. Categorize items by priority (Critical, High, Medium, Low)\n      3. Identify trends, patterns, and potential blockers\n      4. Suggest next steps where appropriate\n      5. Keep the tone professional but engaging for developers\n      6. Use clear markdown formatting for email readability\n      \n      **Repository Data:**\n\n      ## Issues (".concat(issues.length, " total)\n      ").concat(issues.map(function (issue) {
                        var _a;
                        return "\n      **#".concat(issue.number, ": ").concat(issue.title, "**\n      - Status: ").concat(issue.state, " | Author: @").concat(issue.user ? issue.user.login : 'Unknown', "\n      - Created: ").concat(new Date(issue.created_at).toLocaleDateString(), "\n      - Description: ").concat(issue.body ? issue.body.substring(0, 300) + (issue.body.length > 300 ? '...' : '') : 'No description provided', "\n      - Labels: ").concat(((_a = issue.labels) === null || _a === void 0 ? void 0 : _a.map(function (label) { return typeof label === 'string' ? label : label.name; }).join(', ')) || 'None', "\n      ");
                    }).join('\n'), "\n\n      ## Pull Requests (").concat(prsWithDiffs.length, " total)\n      ").concat(prsWithDiffs.map(function (pr) {
                        var _a, _b;
                        return "\n      **#".concat(pr.number, ": ").concat(pr.title, "**\n      - Status: ").concat(pr.state, " | Author: @").concat(pr.user ? pr.user.login : 'Unknown', "\n      - Created: ").concat(new Date(pr.created_at).toLocaleDateString(), "\n      - Target: ").concat(((_a = pr.base) === null || _a === void 0 ? void 0 : _a.ref) || 'main', " \u2190 ").concat(((_b = pr.head) === null || _b === void 0 ? void 0 : _b.ref) || 'unknown', "\n      - Description: ").concat(pr.body ? pr.body.substring(0, 300) + (pr.body.length > 300 ? '...' : '') : 'No description provided', "\n      - Files changed: ").concat(pr.changed_files || 'Unknown', " | +").concat(pr.additions || 0, "/-").concat(pr.deletions || 0, "\n      ").concat(pr.diff ? "- Key changes:\n```diff\n".concat(pr.diff.substring(0, 1500) + (pr.diff.length > 1500 ? '\n...\n' : ''), "\n```") : '- Diff not available', "\n      ");
                    }).join('\n'), "\n\n      ## Recent Commits (").concat(commitsWithDiffs.length, " from main branch)\n      ").concat(commitsWithDiffs.map(function (commit) { return "\n      **".concat(commit.sha.substring(0, 7), "**: ").concat(commit.commit.message.split('\n')[0], "\n      - Author: ").concat(commit.commit.author ? commit.commit.author.name : 'Unknown', "\n      - Date: ").concat(commit.commit.author ? new Date(commit.commit.author.date).toLocaleDateString() : 'Unknown', "\n      ").concat(commit.diff ? "- Changes:\n```diff\n".concat(commit.diff.substring(0, 800) + (commit.diff.length > 800 ? '\n...\n' : ''), "\n```") : '- No diff available', "\n      "); }).join('\n'), "\n\n      ---\n\n      **Please generate a structured weekly digest with the following sections:**\n\n      # \uD83D\uDCCA Weekly Repository Digest - ").concat(new Date().toLocaleDateString(), "\n\n      ## \uD83C\uDFAF Executive Summary\n      [Brief overview of the week's activity and key accomplishments]\n\n      ## \uD83D\uDEA8 Priority Items Requiring Attention\n      [Critical and high-priority issues, PRs that need review, blockers]\n\n      ## \uD83D\uDE80 Key Developments This Week\n      [Major features, bug fixes, improvements with impact assessment]\n\n      ## \uD83D\uDCC8 Activity Metrics\n      [Quantitative summary: X issues opened/closed, Y PRs merged, Z commits]\n\n      ## \uD83D\uDC65 Contributor Highlights\n      [Recognize active contributors and their key contributions]\n\n      ## \uD83D\uDD04 In Progress\n      [Open PRs ready for review, ongoing discussions, work in progress]\n\n      ## \u26A0\uFE0F Issues & Blockers\n      [Open issues categorized by priority with suggested actions]\n\n      ## \uD83D\uDCCB Upcoming Focus Areas\n      [Based on current activity, suggest areas that need attention next week]\n\n      Ensure all information is accurate and based solely on the provided data. Use engaging language appropriate for a technical team while maintaining professionalism.\n    ");
                    // 5. Send to Gemini API for summarization
                    core.info('Sending data to Gemini for summarization...');
                    genAI = new generative_ai_1.GoogleGenerativeAI(geminiApiKey);
                    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
                    return [4 /*yield*/, model.generateContent(prompt_1)];
                case 17:
                    result = _c.sent();
                    summary = result.response.text();
                    core.info('Summary received from Gemini.');
                    core.info(summary);
                    // 7. Send email digest to contributors
                    return [4 /*yield*/, sendEmailDigest(summary, contributors, repoOwner, repoName)];
                case 18:
                    // 7. Send email digest to contributors
                    _c.sent();
                    // 8. Post summary as a new discussion
                    core.info('Posting summary as a new discussion...');
                    discussionTitle = "Repo Digest - ".concat(new Date().toLocaleDateString(), " for ").concat(repoOwner, "/").concat(repoName);
                    _c.label = 19;
                case 19:
                    _c.trys.push([19, 22, , 23]);
                    // First, fetch available discussion categories
                    core.info('Fetching discussion categories...');
                    return [4 /*yield*/, octokit.request('GET /repos/{owner}/{repo}/discussions/categories', {
                            owner: repoOwner,
                            repo: repoName,
                        })];
                case 20:
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
                case 21:
                    discussionResponse = _c.sent();
                    core.info("Successfully created summary discussion! URL: ".concat(discussionResponse.data.html_url));
                    return [3 /*break*/, 23];
                case 22:
                    discussionError_1 = _c.sent();
                    core.warning("Failed to create discussion: ".concat(discussionError_1.message));
                    core.info('Discussion creation failed, but summary was successfully generated.');
                    core.info('Make sure GitHub Discussions are enabled for this repository and the token has discussions:write permission.');
                    return [3 /*break*/, 23];
                case 23: return [3 /*break*/, 25];
                case 24:
                    error_4 = _c.sent();
                    core.setFailed(error_4.message);
                    return [3 /*break*/, 25];
                case 25: return [2 /*return*/];
            }
        });
    });
}
run();
