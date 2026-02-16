# FD2-SampleDBs

Code and tools for building the sample databases used for FarmData2 development.

All of the following documentation assumes that operations are performed within the FarmData2 Development Environment.

## Preliminaries

1. Ensure that the FarmData2 Development environment is up and running in a Codespace.
   - `https://github.com/FarmData2/FarmData2/blob/development/INSTALL.md`
2. Clone this repository into the home directory in the development environment alongside the FarmData2 repository.
   - `cd ~`
   - `git clone https://github.com/FarmData2/FD2-SampleDBs.git`
3. Install the dependencies by:
   - `cd ~/FD2-SampleDBs`
   - `npm ci`
4. Copy the useful libraries from the FarmData2 repository:
   - `cd ~/FD2-SampleDBs`
   - `bin/buildFD2Libs.bash`
5. Ensure you have write access to your origin repository:
   - Create an appropriate GitHub PAT
   - `export GITHUB_TOKEN=<your PAT>`
     - Note; This is necessary because the default token in the codespace is scoped to only the repo from which the codespace was created.
### Development Workflow

To change, modify, update, add a database:

1. Take care of [Preliminaries above](#preliminaries).
2. Create and switch to a new feature branch from the `development` branch in the FD2-SampleDBs repository.
3. Make database changes in your feature branch.
4. [Build the database](#building-the-databases) with your changes.
5. Create and switch to a new feature branch from `development` in the FarmData2 repository.
6. [Manually Install the Database](#manually-installing-a-database).
7. Use the farmOS instance to manually explore the database and ensure that your changes are as intended.  Make any corrections.
8. Run the full FarmData2 test suite.
   - `cd ~/FarmData2`
   - `runAllTests.bash`
9. Fix any tests that were broken by your database update.
10. Commit the patched tests to your feature branch in the FarmData2 repo.
11. Commit your changes to the Database to your feature branch in FD2-SampleDBs repo. Be sure to include:
   - The changes you have made to the code.
   - The newly created database files (e.g. `db.sample.tar.gz`)
12. Ensure that both feature branches are up to date with their `development` branches.
13. Push your feature branches.
14. Create a pull request to the `development` branch in the appropriate upstream for each of your feature branches.

## Building the Databases

The following scripts contained in the `src` directory are used to build the sample databases:

- `baseDB/buildBaseDB.bash`: Builds an empty farmOS database.  This is used as a base for building other sample databases.
- `sampleDB/buildSampleDB.bash`: Builds a sample farmOS database with a small set of records for testing FarmData2 features during development.

## Installing a Database

The `bin/installDB.bash` script can be used to install any of the compressed database in the `dist` directory. Running `installDB.bash` with no command line arguments displays a list of the available databases. Alternatively, the name of a `db.*.tar.gz` file in the `/dist` directory can be specified on the command line.

## Development

### Printing farmOS log/asset JSON

The structure of a farmOS record (e.g. asset, log, quantity, term, user) can be displayed using the command:

`npm run printlog <type>`

where `<type>` is one of the record types.  Run the command without the `<type` argument to see a list of all of the record types.

### FarmData2 Libraries

The `buildFD2libs.bash` command will ensure that the libraries from FarmData2 that are used are copied into this repository.  A directory for each library is created in the `src/libraries` directory.  The imports within the relevant library files are adjusted to the directory structure used here.

The libraries should be maintained only from the FarmData2 repository. When new a library is updated in FarmData2 or added to FarmData2 and the changes are needed here the `buildFD2libs.bash` and `.gitignore` files should be updated and the `buildFD2libs.bash` script should be run again so that the changes are copied and adapted.

## Maintainers

1. Review pull requests and provide feedback
2. If/when appropriate squash merge pull request into the `development` branch
   - The squash merge commit message must be a conventional commit message.
     - See [Conventional Commits](https://conventionalcommits.org)
     - In addition, `BREAKING CHANGE:` must be included in the footer of the commit message to produce a breaking change.
       - See [Semantic Release](https://github.com/semantic-release/semantic-release)
   - This will create a pre-release `vX.Y.Z-development.n`
     - X.Y.Z is the semantic version of the next release if created at the moment
     - n is a sequence number for pre-releases with the same semantic version number.

## Creating a Release

When changes warranting a new release have been added to the `development` branch a maintainer will create a new release by:

1. Updating the `production` and `development` branches from the upstream.
2. Fast-forward merging the latest `development` branch into the `production` branch
3. Pushing the `production` branch to the upstream
   - This will create a new release `vX.Y.Z`
     - X.Y.Z is the semantic version of the release
     - All but the most recent `development` pre-release will be deleted
     - The `CHANGELOG.md` file in the `production` branch is updated with the changes added
     - The `production` branch is _backmerged_ into the `development` branch

Then you will need to:

1. Update the `production` and `development` branches from the upstream to get the backmerged `CHANGELOG.md` file.
