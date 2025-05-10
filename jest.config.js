module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
  transform: {
    '^.+\\.(ts|tsx)$/': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json', // Or specific tsconfig.test.json if you have one
        babelConfig: false, // Explicitly tell ts-jest not to look for Babel config
      },
    ],
  },
  moduleNameMapper: {
    // Handle CSS imports (if you import CSS in components)
    '\\.(css|less|scss|sass)$/': 'identity-obj-proxy',
    // Handle module aliases (if you have them in tsconfig.json)
    '^@/components/(.*)$/': '<rootDir>/app/components/$1',
    '^@/app/(.*)$/': '<rootDir>/app/$1',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Ensure this points to your TS config
    },
  },
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // If you use Next.js specific features that need compilation for Jest, 
  // you might need to investigate further SWC integration with Jest or ensure ts-jest covers it.
  // For now, this simpler config should work for most React component testing.
}; 