module.exports = {
  "testEnvironment": "jsdom",
  "roots": [
    "<rootDir>"
  ],
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx"
  ],
  "transform": {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        "tsconfig": "./tsconfig.json"
      }
    ]
  },
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/$1"
  },
  "setupFilesAfterEnv": [
    "<rootDir>/jest.setup.ts"
  ],
  "testPathIgnorePatterns": [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/tests/"
  ]
}