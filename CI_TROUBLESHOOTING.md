# CI/CD Troubleshooting Guide

## Common Issues and Solutions

### 1. Missing Environment Variables

**Error**: `❌ VERCEL_TOKEN is not set`

**Solution**: Add the following secrets to your GitHub repository:
- Go to Settings → Secrets and variables → Actions
- Add these repository secrets:
  - `VERCEL_TOKEN`: Your Vercel API token
  - `VERCEL_ORG_ID`: Your Vercel organization ID
  - `VERCEL_PROJECT_ID`: Your Vercel project ID

### 2. Build Failures

**Error**: `❌ Build failed - .next directory not found`

**Solutions**:
- Check if `npm run build` completes successfully locally
- Verify all dependencies are installed: `npm ci`
- Check for TypeScript errors: `npm run type-check`
- Check for linting errors: `npm run lint:strict`

### 3. Test Failures

**Error**: Tests failing in CI

**Solutions**:
- Run tests locally: `npm run test:ci`
- Check test coverage: `npm run test:coverage`
- Update snapshots if needed: `npm run test:update`

### 4. Security Audit Failures

**Error**: Security vulnerabilities found

**Solutions**:
- Review vulnerabilities: `npm audit`
- Fix automatically: `npm audit fix`
- Check for high-severity issues: `npm run security-check`

### 5. Bundle Size Issues

**Error**: Bundle size exceeds limits

**Solutions**:
- Check bundle size locally: `npm run bundlesize`
- Optimize imports and remove unused code
- Update `.bundlesizerc.json` limits if needed

### 6. Coverage Upload Issues

**Error**: Codecov upload fails

**Solutions**:
- Verify coverage files exist: `./coverage/lcov.info`
- Check Codecov configuration
- Ensure tests generate coverage: `npm run test:coverage`

## Manual CI Steps

If CI fails, you can run these steps locally to debug:

```bash
# 1. Install dependencies
npm ci

# 2. Type checking
npm run type-check

# 3. Linting
npm run lint:strict

# 4. Format checking
npm run format:check

# 5. Security check
npm run security-check

# 6. Run tests with coverage
npm run test:ci

# 7. Build application
npm run build

# 8. Bundle size analysis
npm run bundlesize

# 9. Audit dependencies
npm run audit-ci
```

## CI Configuration Files

- `.github/workflows/ci.yml` - Main CI/CD pipeline
- `.github/workflows/quality-check.yml` - Quality checks
- `.bundlesizerc.json` - Bundle size configuration
- `.audit-ci.json` - Security audit configuration

## Environment Variables

Required secrets in GitHub repository:
- `VERCEL_TOKEN` - Vercel deployment token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `SNYK_TOKEN` - Snyk security scan token (optional)

## Troubleshooting Commands

```bash
# Check CI status
gh run list

# View specific run logs
gh run view <run-id>

# Rerun failed jobs
gh run rerun <run-id>

# Download artifacts
gh run download <run-id>
```
