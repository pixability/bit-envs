module.exports = {
      testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
      transform: {
        "^.+\\.jsx?$": "<rootDir>/node_modules/babel-jest",
        "^.+\\.tsx?$": "ts-jest"
      },
      "moduleFileExtensions": [
        "ts",
        "tsx",
        "js"
      ],
      testPathIgnorePatterns: [
        "/node_modules/",
        "/.git/"
      ],
      "setupFiles": ["<rootDir>/setup.js"],
      "testEnvironment": "node"
  };
