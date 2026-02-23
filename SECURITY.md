# Security Policy

The Logify team takes security seriously. We appreciate your efforts to responsibly disclose vulnerabilities and will make every effort to acknowledge your contributions.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

Only the latest release of Logify receives security updates. We recommend always running the most recent version.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please report them responsibly using one of the following methods:

### Preferred: GitHub Security Advisories

1. Go to the [Security Advisories](../../security/advisories) page of this repository.
2. Click **"Report a vulnerability"**.
3. Fill in the details of the vulnerability.

This uses GitHub's private vulnerability reporting feature and ensures the report stays confidential.

### Alternative: Email

Send an email to **security@logify.dev** with the following information:

- A description of the vulnerability.
- Steps to reproduce the issue (proof of concept).
- The potential impact of the vulnerability.
- Any suggested fixes, if you have them.

## What to Include

To help us triage and respond quickly, please include as much of the following as possible:

- **Type of vulnerability** (e.g., SQL injection, cross-site scripting, authentication bypass, etc.)
- **Affected component** (e.g., file path, API endpoint, configuration)
- **Step-by-step reproduction instructions**
- **Proof of concept** (code, screenshots, or logs)
- **Impact assessment** -- what an attacker could achieve by exploiting this vulnerability
- **Suggested fix** (if any)

## Response Process

1. **Acknowledgment** -- We will acknowledge receipt of your report within **48 hours**.
2. **Assessment** -- We will investigate and validate the vulnerability, keeping you informed of our progress.
3. **Fix** -- We will develop and test a fix. For critical issues, we aim to release a patch within **7 days**.
4. **Disclosure** -- Once a fix is released, we will publish a security advisory crediting you (unless you prefer to remain anonymous).

## Disclosure Policy

- We follow a **coordinated disclosure** approach.
- We ask that you give us a reasonable amount of time to address the vulnerability before making any public disclosure.
- We will coordinate with you on the timing of public announcements.
- We will credit reporters in the security advisory unless they request otherwise.

## Security Best Practices for Contributors

When contributing to Logify, please keep the following in mind:

- **Never commit secrets.** Do not commit API keys, passwords, tokens, or other credentials. Use environment variables and `.env` files (which are in `.gitignore`).
- **Validate all input.** Sanitize user input on both client and server sides.
- **Keep dependencies updated.** Use `npm audit` to check for known vulnerabilities.
- **Follow the principle of least privilege.** Request only the permissions your code needs.

## Scope

This security policy applies to the Logify repository and its official distributions. Third-party plugins, forks, or unofficial distributions are outside the scope of this policy.

Thank you for helping keep Logify and its users safe.
