## Security Policy

### Supported Versions
We aim to keep `main` secure. Older tags may not receive patches.

### Reporting a Vulnerability
Please report security issues privately:
- Open a private GitHub Security Advisory for this repository, or
- Email a private report to the maintainers (do not open a public issue)

Include:
- Affected endpoints/components
- Steps to reproduce and impact
- Proof-of-concept if available

We will acknowledge receipt within 3 business days and provide status updates until resolution. Do not disclose publicly until a fix is released and a coordinated disclosure window has elapsed.

### Secrets
Never include real credentials in issues, PRs, or test assets. Use `.env.local` and Vercel Project Environment Variables.

### Dependencies
We regularly audit dependencies in CI/build. If you spot a vulnerable package, please include remediation version(s) in your report.


