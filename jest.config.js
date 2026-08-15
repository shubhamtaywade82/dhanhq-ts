module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: ["src/**/*.ts", "!src/generated/**", "!src/bin/**"],
  // Floors set a few points below the measured baseline so incidental drift
  // doesn't fail CI, while a real regression (e.g. a new untested module) does.
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 55,
      functions: 62,
      lines: 70,
    },
  },
};
