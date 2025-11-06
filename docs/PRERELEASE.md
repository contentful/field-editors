# PR Pre-release Workflow

This document describes the automated pre-release workflow for pull requests.

## Overview

When you add the `pre-release` label to a pull request, CircleCI automatically:

1. Creates pre-release versions of all packages
2. Publishes them to **npm** (public registry)
3. Publishes them to **GitHub Package Registry** (private registry)
4. Comments on the PR with installation instructions

## Usage

### Creating a Pre-release

1. Open your pull request
2. Add the `pre-release` label to the PR
3. Wait for the workflow to complete (~2-5 minutes)
4. A comment will be added with the pre-release versions

### Example Comment

The workflow will post a comment like this:

````markdown
## 🚀 Pre-release Published

Pre-release versions have been published to **npm** and **GitHub Package Registry** with tag `pr-123`.

### 📦 Updated Packages

| Package                              | Version                                 |
| ------------------------------------ | --------------------------------------- |
| `@contentful/field-editor-rich-text` | `1.2.3-pr-123.feature-branch.a1b2c3d.0` |
| `@contentful/field-editor-markdown`  | `1.0.5-pr-123.feature-branch.a1b2c3d.0` |

### 📥 Installation

#### From npm (Public)

```bash
# Install specific version
yarn add @contentful/field-editor-rich-text@1.2.3-pr-123.feature-branch.a1b2c3d.0

# Or install with PR tag
yarn add @contentful/field-editor-rich-text@pr-123
```
````

#### From GitHub Packages (Requires Authentication)

```bash
# Configure registry
echo "@contentful:registry=https://npm.pkg.github.com" >> .npmrc

# Install specific package
yarn add @contentful/field-editor-rich-text@1.2.3-pr-123.feature-branch.a1b2c3d.0
```

```

## Version Format

Pre-release versions follow this format:

```

<current-version>-pr-<pr-number>.<sanitized-branch>.<commit-hash>.<increment>

````

Example: `1.2.3-pr-456.fix-bug.abc1234.0`

Components:
- **current-version**: Base version from package.json (e.g., `1.2.3`)
- **pr-number**: Pull request number (e.g., `456`)
- **sanitized-branch**: Branch name with special characters replaced by hyphens
- **commit-hash**: Short commit hash (7 characters)
- **increment**: Pre-release increment number (starts at 0)

## Installation

Pre-releases are published to **both npm and GitHub Package Registry**. Most users should install from npm (simpler, no authentication needed).

### Option A: Install from npm (Recommended)

No authentication required - just install directly:

#### Install Specific Version

```bash
yarn add @contentful/field-editor-rich-text@1.2.3-pr-123.feature-branch.a1b2c3d.0
````

#### Install Using PR Tag

```bash
# Always installs the latest pre-release for PR #123
yarn add @contentful/field-editor-rich-text@pr-123
```

#### Install All Updated Packages

```bash
# From the PR comment, install all packages
yarn add \
  @contentful/field-editor-rich-text@pr-123 \
  @contentful/field-editor-markdown@pr-123
```

### Option B: Install from GitHub Package Registry

Only needed if you prefer GitHub Packages or have specific registry requirements.

#### Prerequisites

1. **GitHub Authentication**: Personal Access Token (PAT) with `read:packages` scope
2. **npm Configuration**: Registry configuration for `@contentful` scope

#### Setup Authentication

Create a `.npmrc` file in your project (or `~/.npmrc` globally):

```bash
# Set registry for @contentful scope
@contentful:registry=https://npm.pkg.github.com

# Add authentication token
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

**Getting a GitHub Token:**

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `read:packages` scope
3. Copy the token and add it to your `.npmrc`

#### Installing Pre-releases

```bash
# Install specific version
yarn add @contentful/field-editor-rich-text@1.2.3-pr-123.feature-branch.a1b2c3d.0

# Install using PR tag
yarn add @contentful/field-editor-rich-text@pr-123
```

## Workflow Details

### Trigger

The CircleCI pipeline triggers when:

- A label is added to a pull request via GitHub webhook
- The label name is exactly `pre-release`

**Setup Required**: CircleCI must be configured to receive GitHub webhook events for `pull_request.labeled`

### Steps

1. **Checkout**: Checks out the PR branch
2. **Install**: Installs dependencies with Yarn (using CircleCI cache)
3. **Configure**: Sets up authentication via Contentful Vault
4. **Build**: Builds all packages
5. **Version**: Creates pre-release versions using Lerna with PR-specific identifier
6. **Publish**: Publishes to both npm and GitHub Package Registry with PR-specific dist-tag
7. **Comment**: Posts installation instructions to the PR via GitHub API

### Configuration & Secrets

The CircleCI job uses:

- **Context**: `vault` - Provides access to Contentful Vault for secrets
- **Vault Secrets**:
  - Authentication tokens for npm and GitHub Packages (via `semantic-release` template)
  - GitHub token for API access (to post comments)
  - Lerna configuration (via `vault/configure-lerna`)

Required CircleCI setup:

- GitHub webhook configured for `pull_request.labeled` events
- Vault context with semantic-release permissions

## Multiple Pre-releases

You can create multiple pre-releases for the same PR:

1. Make changes and push to the PR branch
2. Re-add the `pre-release` label (or remove and add again)
3. A new pre-release will be created with an incremented version

The bot comment will be updated with the latest versions.

## Dist Tags

Each PR publishes with a unique dist-tag: `pr-<number>`

This allows you to:

- Install the latest pre-release for a PR without specifying the full version
- Avoid version conflicts between different PRs
- Keep pre-releases isolated from production releases

## Troubleshooting

### Workflow Doesn't Trigger

**Problem**: Adding the label doesn't start the workflow

**Solutions**:

- Ensure the label is exactly named `pre-release` (case-sensitive)
- Check the Actions tab for any errors
- Verify GitHub Actions is enabled for the repository

### Build Failures

**Problem**: Workflow fails during build step

**Solutions**:

- Ensure your PR branch builds successfully locally
- Check for TypeScript errors or linting issues
- Review the workflow logs in the Actions tab

### Publishing Failures

**Problem**: Workflow fails during publish step

**Solutions**:

- Verify `GITHUB_TOKEN` has correct permissions
- Check if package names are properly scoped (`@contentful/...`)
- Ensure `lerna.json` has correct registry configuration

### Installation Failures

**Problem**: Cannot install pre-release in dependent project

**Solutions**:

- Verify `.npmrc` has correct registry and authentication
- Ensure GitHub token has `read:packages` scope
- Try clearing npm/yarn cache: `yarn cache clean`
- Check package visibility in GitHub Packages

### Authentication Errors

**Problem**: `401 Unauthorized` when installing

**Solutions**:

- Regenerate GitHub Personal Access Token
- Verify token has `read:packages` scope
- Check `.npmrc` format (no extra spaces)
- Ensure token hasn't expired

## Best Practices

### When to Use Pre-releases

✅ **Use for**:

- Testing changes in dependent projects
- Validating fixes before merge
- Sharing WIP with team members
- Integration testing across repositories

❌ **Don't use for**:

- Production deployments
- Long-term version pinning
- Public package distribution

### Cleaning Up

Pre-releases should be temporary:

- Remove old pre-releases after PR is merged
- Don't accumulate many pre-release versions
- Use GitHub Packages UI to delete old versions

### Security

- **Never commit** `.npmrc` with authentication tokens to git
- Use **environment variables** for tokens in CI/CD
- Use **read-only tokens** when possible
- **Rotate tokens** regularly

## Comparison with Branch Pre-releases

| Feature        | PR Pre-release           | Branch Pre-release (CircleCI) |
| -------------- | ------------------------ | ----------------------------- |
| Trigger        | Manual (label)           | Automatic (every push)        |
| Use Case       | Testing specific changes | Continuous pre-releases       |
| Version Format | `pr-X.branch.hash.N`     | `branch.hash.N`               |
| Dist Tag       | `pr-X`                   | `prerelease`                  |
| Comment on PR  | Yes ✓                    | No                            |
| Frequency      | On-demand                | Every commit                  |

### When to Use Each

- **PR Pre-release**: When you want to test a specific PR version in a dependent project
- **Branch Pre-release**: For continuous testing of branch changes without manual intervention

## Examples

### Testing a Fix in Dependent Project

1. Create PR with fix in `field-editors`
2. Add `pre-release` label
3. In dependent project:
   ```bash
   yarn add @contentful/field-editor-rich-text@pr-456
   ```
4. Test the fix
5. Provide feedback on PR

### Validating Breaking Changes

1. Create PR with breaking changes
2. Add `pre-release` label
3. Update multiple dependent projects
4. Verify all projects work with new version
5. Document migration in PR description

### Integration Testing

1. Create PRs in multiple repos
2. Add `pre-release` label to each
3. Install all pre-releases in test environment
4. Run end-to-end tests
5. Merge if tests pass

## FAQ

**Q: Can I create pre-releases for merged PRs?**
A: No, the workflow only runs on open PRs. After merge, use regular releases.

**Q: How long are pre-releases stored?**
A: GitHub Packages stores them indefinitely. Clean up old versions manually.

**Q: Can I use pre-releases in production?**
A: No, pre-releases are for testing only and may be deleted at any time.

**Q: Do pre-releases create git tags?**
A: No, pre-releases don't create git tags or commits.

**Q: Can I automate pre-release label addition?**
A: Yes, you can create another workflow that adds the label based on conditions.

**Q: What if my PR has conflicts?**
A: Resolve conflicts first. The workflow checks out the PR branch as-is.

## Related Documentation

- [Pre-release Documentation](./PRE_RELEASE.md) - Branch-based pre-releases
- [Lerna Versioning](https://lerna.js.org/docs/features/version-and-publish)
- [GitHub Package Registry](https://docs.github.com/en/packages)
