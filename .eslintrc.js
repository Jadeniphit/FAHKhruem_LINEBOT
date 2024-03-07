module.exports = {
  "env": {
    "es6": true,
    "node": true,
  },
  "parserOptions": {
    "ecmaVersion": 2018,
  },
  "extends": [
    "eslint:recommended",
    "google",
  ],
  "rules": {
    "no-restricted-globals": ["error", "name", "length"],
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    "max-len": ["error", {"code": 100}],
    "no-unused-vars": ["error", {"args": "none"}], // Ignore unused function parameters
  },
  "overrides": [
    {
      "files": ["**/*.spec.*"],
      "env": {
        "mocha": true,
      },
      "rules": {},
    },
  ],
  "globals": {},
};
