# Husky - Git Hooks & Code Quality

This project uses **Husky** to enforce code quality standards before commits and pushes.

## 📋 What is Husky?

Husky is a tool that manages Git hooks to prevent bad commits and pushes. It integrates with your workflow to:

- Run linters and formatters automatically
- Execute tests before pushing code
- Enforce code style consistency

## 🔧 Configuration Files

### `.prettierrc`

- Defines code formatting rules (semicolons, quotes, line width, etc.)
- Auto-formats code to maintain consistency

### `.eslintrc.json`

- Defines linting rules for JavaScript and TypeScript
- Catches potential bugs and enforces best practices
- Includes rules for TypeScript, recommended settings, and custom rules

### `.lintstagedrc`

- Configures which files are checked by which tools
- Only lints/formats staged files before commit

### `.husky/pre-commit`

- Runs before each commit
- Executes linting and formatting on staged files
- Prevents commits with linting errors

### `.husky/pre-push`

- Runs before each push
- Executes tests and type checking
- Prevents pushing broken code

## 🚀 Available Scripts

```bash
# Format all files with Prettier
pnpm format

# Lint all files
pnpm lint

# Fix linting issues automatically
pnpm lint:fix

# Run type checking
pnpm type-check

# Run tests
pnpm test
```

## 📝 Git Workflow

### Before Commit

1. **Staged files are formatted** using Prettier
2. **Staged files are linted** using ESLint
3. If errors occur, the commit is blocked
4. Fix issues and try again

### Before Push

1. **Tests run** on the entire codebase
2. **Type checking** is performed
3. If failures occur, the push is blocked

## ✅ Bypassing Hooks (Use Carefully!)

If you need to skip hooks temporarily:

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip pre-push hook
git push --no-verify
```

⚠️ **Note:** Only use this in exceptional cases!

## 🔄 Reinstalling Husky

If hooks aren't working:

```bash
pnpm install
```

The `prepare` script will automatically reinstall hooks.

## 📖 More Information

- [Husky Documentation](https://typicode.github.io/husky/)
- [ESLint Documentation](https://eslint.org/)
- [Prettier Documentation](https://prettier.io/)
- [Lint-Staged Documentation](https://github.com/okonet/lint-staged)
