# Weekly Recap Action

This automatically pipes all Pull requests (and their diffs), commits, and issues into Gemini to create a weekly digest that is automatically uploaded as a discussion and optionally sent via email to contributors.

## Features

- 📊 **Comprehensive Analysis**: Analyzes issues, pull requests (with diffs), and recent commits
- 🤖 **AI-Powered Insights**: Uses Google Gemini AI to generate structured, actionable weekly digests
- 💬 **GitHub Discussions**: Automatically posts digest as a repository discussion
- 📧 **Email Distribution**: Optionally sends digest via email to contributors with public email addresses
- 🎯 **Professional Format**: Generates well-structured reports with priority categorization and actionable insights

## Usage

### Basic Usage (Discussion Only)

```yaml
- name: Generate Weekly Digest
  uses: your-org/weekly-recap@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
    repo_owner: ${{ github.repository_owner }}
    repo_name: ${{ github.event.repository.name }}
```

### With Email Distribution

```yaml
- name: Generate Weekly Digest with Email
  uses: your-org/weekly-recap@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
    repo_owner: ${{ github.repository_owner }}
    repo_name: ${{ github.event.repository.name }}
    email_enabled: "true"
    smtp_host: "smtp.gmail.com"
    smtp_port: "587"
    smtp_user: ${{ secrets.SMTP_USER }}
    smtp_password: ${{ secrets.SMTP_PASSWORD }}
    from_email: "digest@yourorg.com"
    from_name: "Weekly Repository Digest"
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `github_token` | GitHub token for API access | Yes | |
| `gemini_api_key` | Google Gemini API key | Yes | |
| `repo_owner` | Repository owner | Yes | |
| `repo_name` | Repository name | Yes | |
| `email_enabled` | Enable email distribution | No | `false` |
| `smtp_host` | SMTP server hostname | No | |
| `smtp_port` | SMTP server port | No | `587` |
| `smtp_user` | SMTP username | No | |
| `smtp_password` | SMTP password | No | |
| `from_email` | Sender email address | No | |
| `from_name` | Sender display name | No | `Repository Digest Bot` |

## Email Configuration

### Gmail Setup
1. Enable 2FA on your Gmail account
2. Generate an App Password
3. Use `smtp.gmail.com` as the host with port `587`
4. Use your Gmail address as `smtp_user` and the App Password as `smtp_password`

### Other SMTP Providers
- **SendGrid**: Use `smtp.sendgrid.net:587`
- **Mailgun**: Use `smtp.mailgun.org:587`  
- **AWS SES**: Use your region's SES SMTP endpoint

## Privacy Considerations

- Only contributors with **public email addresses** in their GitHub profiles will receive emails
- The action respects GitHub's privacy settings and won't access private email information
- Email distribution can be disabled entirely by setting `email_enabled: "false"`

## Digest Structure

The generated digest includes:

- **📊 Executive Summary**: Brief overview of weekly activity
- **🚨 Priority Items**: Critical issues and PRs requiring attention
- **🚀 Key Developments**: Major features and improvements
- **📈 Activity Metrics**: Quantitative summary of activity
- **👥 Contributor Highlights**: Recognition of active contributors
- **🔄 In Progress**: Open PRs and ongoing work
- **⚠️ Issues & Blockers**: Prioritized issue list with suggestions
- **📋 Upcoming Focus**: Suggested areas for next week

## Required Secrets

Add these secrets to your repository:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `SMTP_USER`: SMTP username (if using email)
- `SMTP_PASSWORD`: SMTP password (if using email)

## Permissions

Ensure your GitHub token has the following permissions:
- `contents: read`
- `discussions: write`
- `metadata: read`
