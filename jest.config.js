module.exports = {
  verbose: false,
  testMatch: [
    '**/*test.{ts,js}',
    '!**/mocha/**',
    '!**/playground/**',
    '!**/*test-helper*',
    '!**/*anti-pattern*', // Uncomment this only when you want to inspect the consequences of anti-patterns
    '!**/*performance*', //Uncomment this only when you want to inspect the performance of tests
  ],
  collectCoverage: false,
  coverageReporters: ['text-summary', 'lcov'],
  collectCoverageFrom: ['**/*.js', '!**/node_modules/**', '!**/test/**'],
  forceExit: true,
  setupFilesAfterEnv: ['jest-extended/all'],
  testEnvironment: 'node',
  notify: true,
  globalSetup: './example-application/test/setup/global-setup.js',
  globalTeardown: './example-application/test/setup/global-teardown.js',
  notifyMode: 'change',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
    [
      'jest-watch-repeat',
      {
        key: 'r',
        prompt: 'repeat test runs.',
      },
    ],
    [
      'jest-watch-suspend',
      {
        key: 's',
        prompt: 'suspend watch mode',
      },
    ],
    'jest-watch-master',
    [
      'jest-watch-toggle-config',
      {
        setting: 'verbose',
      },
    ],
    [
      'jest-watch-toggle-config',
      {
        setting: 'collectCoverage',
      },
    ],
  ],
};
