const config = {
  "branches": [
    "production",
    { "name": "development", "prerelease": true },
  ],
  "ci": true,
  "plugins": [
    [
      "@semantic-release/commit-analyzer",
      {
        "preset": "angular",
        "releaseRules": [
          { "type": "build", "release": "patch" },
          { "type": "ci", "release": "patch" },
          { "type": "docs", "release": false },
          { "type": "perf", "release": "patch" },
          { "type": "refactor", "release": "patch" },
          { "type": "style", "release": "patch" },
          { "type": "test", "release": false },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        "preset": "conventionalcommits",
        "presetConfig": {
          "types": [
            { "type": "build", "section": "Build System", "hidden": false },
            { "type": "chore", "section": "Chores", "hidden": false },
            { "type": "ci", "section": "Continuous Integration", "hidden": false },
            { "type": "docs", "section": "Documentation", "hidden": false },
            { "type": "feat", "section": "Features", "hidden": false },
            { "type": "fix", "section": "Fixes", "hidden": false },
            { "type": "perf", "section": "Performance Improvements", "hidden": false },
            { "type": "refactor", "section": "Refactoring", "hidden": false },
            { "type": "style", "section": "Style", "hidden": false },
            { "type": "test", "section": "Tests", "hidden": false },
          ],
        },
      },
    ],
    [
      "@semantic-release/github",
      {
        "assets": [
          { "path": "dist/db.base.tar.gz", "label": "Base (empty) database." },
          { "path": "dist/db.sample.tar.gz", "label": "Sample database." },
        ],
      },
    ],
  ],
}

/* 
 * We only keep a CHANGELOG.md file in the release branch.
 * This prevents merge conflicts when development is merged into main.
 * 
 * As suggested in:
 *   https://github.com/semantic-release/changelog/issues/51#issuecomment-682609394
 * 
 * We also only backmerge main into development when pushing to the release branch.
 * This ensures development matches main and semver for pre-releases is correct.
 * 
 * As suggested in:
 *   https://github.com/semantic-release/semantic-release/issues/1460#issuecomment-789377269
 */
const ref = process.env.GITHUB_REF;
const branch = ref.split('/').pop();
if (config.branches.some(it => it === branch || (it.name === branch && !it.prerelease))) {
  config.plugins.push(
    "@semantic-release/changelog",
    [
      "@semantic-release/git",
      {
        "assets": ["CHANGELOG.md"],
        "message": "chore(release): Release version ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      },
    ],
    [
      "@saithodev/semantic-release-backmerge",
      {
        "backmergeBranches": ["development"],
      },
    ],
  )
}

module.exports = config