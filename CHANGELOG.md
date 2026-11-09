# Changelog

## [0.5.0] - 2026-11-08

### Added

- User registration and login
- Post creation and feed browsing
- Tag-based search
- Deleting your own post (owner-only)
- Unit, integration, and end-to-end (Playwright) tests
- Rate limiting on login and register
- Structured logging for failed logins
- CI job that fails on high-severity dependency vulnerabilities

### Fixed

- Broken access control, a weak JWT secret, and misconfigured error handling
- authorId spoofing on publish
- Vulnerable dependencies reported by npm audit
