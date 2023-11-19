#!/bin/bash
# shellcheck disable=SC1091  # Make sources okay.

# Define some useful variables, import libraries and 
# check some common pre-conditions.
REPO_DIR=$(git rev-parse --show-toplevel)       
source "$REPO_DIR/bin/preflight.bash"

echo -e "${UNDERLINE_GREEN}Building the sample database${NO_COLOR}"

# Ensure that the base (empty) database exits
if [ ! -f "$REPO_DIR/dist/db.base.tar.gz" ]; then
  echo -e "${RED}ERROR:${NO_COLOR} The db.base.tar.gz database must exist."
  echo -e "${RED}ERROR:${NO_COLOR} Use bin/buildBaseDB.bash to create it."
  exit 255
fi

# Install the base database so we can build the sample database on top.
"$REPO_DIR/bin/installDB.bash" db.base.tar.gz
error_check
echo ""

# Set the farm name and "slogan"
"$SCRIPT_DIR/setFarmInfo.bash"
error_check
echo ""

# Enable the FarmData2 modules in farmos
"$SCRIPT_DIR/enableFarmData2Modules.bash"
error_check
echo ""

# Add the Allowed CORS origins to the farm consumer.
echo "Adding CORS origins..."
CUR_DIR=$(pwd)
safe_cd "$REPO_DIR"
npx cypress run --spec=src/sampleDB/addConsumerCORSOrigins.cy.js
error_check 
safe_cd "$CUR_DIR"
echo "Added."

# Add the users and assign their roles
"$SCRIPT_DIR/addUsers.bash"
error_check
echo ""

# Add the areas
node "$SCRIPT_DIR/addAreas.js"
error_check
echo ""

# Add the crop families and crops
node "$SCRIPT_DIR/addCrops.js"
error_check
echo ""

# Add the seeding tray sizes
node "$SCRIPT_DIR/addTraySizes.js"
error_check
echo ""

# Add the units
node "$SCRIPT_DIR/addUnits.js"
error_check
echo ""

# Delete the authentication token if it exists.
# Necessary because base DB was reinstalled so old token is not valid. 
echo "Deleting locally cached authentication token..."
rm -rf "$SCRIPT_DIR/scratch"
echo "Deleted."
echo ""

# Make sure that the new FarmData2/docker/db directory has appropriate permissions.
echo "Setting permissions on $HOME/FarmData2/docker/db..."
sudo chmod g+rwx "$HOME/FarmData2/docker/db"
error_check
sudo chgrp fd2dev "$HOME/FarmData2/docker/db"
error_check
echo "  Set."

# Compress the sample database into the dist directory
echo "Compressing base database..."
safe_cd "$HOME/FarmData2/docker/db"
DIST_FILE="$REPO_DIR/dist/db.sample.tar.gz"
rm "$DIST_FILE" > /dev/null
sudo tar czvf "$DIST_FILE" ./* > /dev/null
error_check
sudo chown fd2dev "$DIST_FILE"
error_check
sudo chgrp fd2dev "$DIST_FILE"
error_check
sudo chmod g+w "$DIST_FILE"
error_check
echo "  Compressed into $DIST_FILE"

echo -e "${UNDERLINE_GREEN}Sample database has been built.${NO_COLOR}"