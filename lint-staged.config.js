module.exports = {
    "**/*.js{,x}": ["yarn organize-imports", "yarn format"],
    "**/*.ts{,x}": [
        "eslint --fix --max-warnings 0 --no-eslintrc --config .eslintrc.lint-staged.js",
        "yarn organize-imports",
        "yarn format",
    ],
    "**/*.{json,yml,html,css,less,scss,md}": "yarn format",
    "**/{*,__}": () => "yarn lint:monorepo",
    "**/{package.json, __}": () => "yarn install --immutable",
};
