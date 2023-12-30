# FD2-SampleDBs

Code and tools for building the sample databases used for FarmData2 development.

All of the following documentation assumes that operations are performed within the FarmData2 Development Environment.

## Preliminaries

Install the dependencies by:
- Change into the `FD2-SampleDBs` directory
- run `npm install`

Link to the `FarmData2/library/farmosUtil` directory:
  - The following commands assume that `FarmData2` and `FD2-SampleDBs` are cloned in the user's home directory.  Please adjust accordingly.
  - `cd ~/FD2-SampleDBs/library`
  - `ln -s ~/FarmData2/library/farmosUtil farmosUtil`

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

### farmosUtil.js

The `src/library/farmosUtil/` is a symlink to the `FarmData2/library/farmosUtil` module that provides useful utility functions for working with farmOS records.  These functions should be maintained and updated from the `FarmData2` repo.

### Development Workflow

To change, modify, update, add a database:

- Prerequisites:
  - Fork the `FD2-SampleDBs` upstream repository
  - Clone your fork into the FarmData2 Development Environment
1. Ensure that your `development` branch is synchronized with the `upstream`
2. Create a new feature branch from the `development` branch
3. Make and test changes in your feature branch
4. Run the appropriate script(s) to build the database
5. Install and test that the new database works 
   - See [Manually Installing a Database](#manually-installing-a-database) above
6. Commit to your feature branch:
   - The changes you have made to the code.
   - The newly created database files (e.g. `db.base.tar.gz`)
7. Pull and merge any new changes to the `development` branch into your feature branch
8. Create a pull request to the `development` branch in the upstream

A maintainer will:

1. Review your pull request and provide feedback
2. If/when appropriate squash merge your pull request into the `development` branch
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
