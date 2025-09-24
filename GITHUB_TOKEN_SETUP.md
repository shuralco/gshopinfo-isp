# 🔐 GitHub Token Setup Instructions

## Step 1: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Token name: `gshopinfo-deployment`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages)
   - ✅ `admin:repo_hook` (Full control of repository hooks)
   - ✅ `delete_repo` (Delete repositories) - optional
5. Click "Generate token"
6. **COPY THE TOKEN IMMEDIATELY!** (shown only once)

## Step 2: Configure MCP Server

### Option A: Environment Variable (Recommended)
```bash
# Add to your shell profile (~/.bashrc or ~/.zshrc)
export GITHUB_TOKEN="ghp_your_token_here"
export GITHUB_USERNAME="your_github_username"

# Reload shell
source ~/.bashrc
```

### Option B: MCP Configuration File
Create or update `.mcp.json`:
```json
{
  "mcpServers": {
    "github": {
      "command": "mcp-server-github",
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

## Step 3: Test Authentication
After setting up, test with:
```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

## Security Notes
- Never commit tokens to git
- Add `.mcp.json` to `.gitignore` if it contains tokens
- Rotate tokens regularly
- Use fine-grained tokens when possible

## Required Token Permissions for This Project
- `repo` - Create and manage repositories
- `workflow` - Update GitHub Actions
- `admin:repo_hook` - Manage webhooks for deployment