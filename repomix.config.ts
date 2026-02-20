/**
 * Repomix Configuration
 *
 * This is the primary configuration file for Repomix.
 * Note: repomix.config.ts is excluded from the app's tsconfig.json so that
 * this file can freely use repomix types when repomix is installed locally,
 * without breaking the application typecheck when it is not.
 *
 * All ignore patterns and configuration are centralized here.
 * Optimized for Copilot Browser Agent to reduce noise and improve context quality.
 */
export default {
  $schema: 'https://repomix.com/schemas/latest/schema.json',

  input: {
    maxFileSize: 10485760, // 10MB - skip very large files
  },

  output: {
    filePath: 'repo-context.xml',
    style: 'xml',
    parsableStyle: false,
    fileSummary: true,
    directoryStructure: true,
    files: true,
    removeComments: false, // Keep comments for context
    removeEmptyLines: false, // Keep structure for readability
    compress: true, // Full content for accurate understanding
    topFilesLength: 10, // Show top 10 files by size
    showLineNumbers: true, // Essential for debugging
    truncateBase64: true, // Reduce noise from embedded data
    copyToClipboard: false,
    includeFullDirectoryStructure: true,
    tokenCountTree: true, // Useful for token optimization
    git: {
      sortByChanges: false,
      sortByChangesMaxCommits: 100,
      includeDiffs: false, // Diffs add noise
      includeLogs: false, // Logs add noise
      includeLogsCount: 50,
    },
  },

  include: [],

  ignore: {
    useGitignore: true, // Respect .gitignore
    useDotIgnore: false, // We're deprecating .repomixignore
    useDefaultPatterns: true, // Use repomix defaults

    /**
     * Custom ignore patterns optimized for Copilot Browser Agent.
     * Organized by category to reduce cognitive load.
     */
    customPatterns: [
      // ==================== Dataconnect ====================
      'dataconnect-generated/',
      'documentai-templates/',
      'schematics/',
      'src/assets/i18n/data/',
      // ==================== Dependencies ====================
      'node_modules/',
      '.pnpm-store/',
      '.yarn/',
      '.yarn-cache/',

      // ==================== Build Artifacts ====================
      'dist/',
      'build/',
      'out/',
      'coverage/',
      '.angular/',
      '.angular/cache/',
      'playwright-report/',
      '.playwright/',

      // ==================== Firebase / Cloud ====================
      '.firebase/',
      '.firebaserc',
      '.emulators/',
      'dataconnect/', // Firebase Data Connect generated code

      // ==================== Cache / Temporary ====================
      '.cache/',
      '.tmp/',
      'temp/',
      '*.log',
      '*.tmp',

      // ==================== IDE / Editor ====================
      '.vscode/',
      '.idea/',
      '*.swp',
      '*.swo',
      '*~',

      // ==================== Operating System ====================
      '.DS_Store',
      'Thumbs.db',
      'desktop.ini',

      // ==================== Generated Files ====================
      '*.map', // Source maps
      '*.d.ts.map', // TypeScript declaration maps
      '*.tsbuildinfo', // TypeScript build info

      // ==================== Lock Files ====================
      'package-lock.json',
      'pnpm-lock.yaml',
      'yarn.lock',
      'bun.lockb',

      // ==================== Images & Media (Binary) ====================
      '*.png',
      '*.jpg',
      '*.jpeg',
      '*.gif',
      '*.ico',
      '*.svg',
      '*.webp',
      '*.avif',
      '*.mp4',
      '*.webm',
      '*.ogg',
      '*.mp3',
      '*.wav',
      '*.pdf',

      // ==================== Fonts (Binary) ====================
      '*.woff',
      '*.woff2',
      '*.ttf',
      '*.eot',
      '*.otf',

      // ==================== Test Files ====================
      '*.spec.ts', // Unit tests
      '*.spec.js',
      '*.test.ts',
      '*.test.js',
      'e2e/', // E2E tests
      'tests/',
      '__tests__/',
      'playwright.config.ts', // Already documented elsewhere

      // ==================== Git Internals ====================
      '.git/',
      '.gitignore',
      '.gitkeep',
      '.gitattributes',

      // ==================== GitHub / CI ====================
      '.github/', // GitHub Actions, templates, etc.
      '.husky/', // Git hooks
      '.codacy/',

      // ==================== Documentation Archives ====================
      '.github/instructions/archive/', // Archived instruction files
      'docs/archive/', // Archived documentation
      'docs/',

      // ==================== Configuration Files (Non-Code) ====================
      '.editorconfig',
      '.npmignore',
      '.npmrc',
      '.nvmrc',
      '.prettierignore',
      '.prettierrc',
      '.prettierrc.js',
      '.prettierrc.json',
      '.yarnrc.yml',
      'apphosting.yaml',
      'stylelint.config.mjs',
      'firebase.json',

      // ==================== Scripts & Tooling ====================
      'scripts/', // Build/deploy scripts (not core code)

      // ==================== Documentation (Text) ====================
      'LICENSE',
      'CHANGELOG.md', // History, not current state
      '*.txt', // Generic text files

      // ==================== Temporary Asset Folders ====================
      'src/assets/tmp/',
      'public/tmp/',

      // ==================== Repomix Output ====================
      'repo-context.xml', // Our own output
      'repo-context.md',
      'repo-context.txt',
      'repo-context.json',

      // ==================== Claude Skills Output ====================
      // Keep SKILL.md but exclude large generated files if needed
      // '.claude/skills/*/references/files.md', // Uncomment if too large
    ],
  },

  security: {
    enableSecurityCheck: true, // Prevent accidental exposure of secrets
  },

  tokenCount: {
    encoding: 'o200k_base', // OpenAI's encoding for GPT-4 and newer
  },
}

