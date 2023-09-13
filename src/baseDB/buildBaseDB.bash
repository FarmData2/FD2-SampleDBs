#!/bin/bash
# shellcheck disable=SC1091  # Make sources okay.

SCRIPT_PATH=$(readlink -f "$0")       # Path to this script.
SCRIPT_DIR=$(dirname "$SCRIPT_PATH")  # Path to directory containing this script.
SRC_DIR=$(dirname "$SCRIPT_DIR")
REPO_DIR=$(dirname "$SRC_DIR")     # Path to the main repo directory      

source "$REPO_DIR/bin/colors.bash"
source "$REPO_DIR/bin/lib.bash"

# Ensure that this script is being run in the development container.
HOST=$(docker inspect -f '{{.Name}}' "$HOSTNAME" 2> /dev/null)
if [ ! "$HOST" == "/fd2_dev" ]; then
  echo -e "${RED}ERROR:${NO_COLOR} The buildBaseDB.bash script must be run in the fd2dev container."
  exit 255
fi

# Ensure that the FarmData2 repository exits
if [ ! -d "$HOME/FarmData2" ]; then
  echo -e "${RED}ERROR:${NO_COLOR} The FarmData2 repository must be in /home/fd2dev/FarmData2".
  exit 255
fi

echo -e "${UNDERLINE_GREEN}Building the base (empty) database${NO_COLOR}"

# Clearing the drupal cache
echo "Clearing the drupal cache..."
docker exec -it fd2_farmos drush cr
echo "  Cleared."

# Shut down the farmOS container
echo "Stopping the farmOS container..."
docker stop fd2_farmos > /dev/null
echo "  Stopped."

# Shut down database container
echo "Stopping the database container..."
docker stop fd2_postgres > /dev/null
echo "  Stopped."

# Make sure that the FarmData2/docker/db directory has appropriate permissions.
echo "Setting permissions on $HOME/FarmData2/docker/db..."
sudo chmod g+rwx "$HOME/FarmData2/docker/db"
error_check
sudo chgrp fd2dev "$HOME/FarmData2/docker/db"
error_check
safe_cd "$HOME/FarmData2/docker/db"
echo "  Set."

# Backup the current database if desired.
Y_N=""
while [[ "$Y_N" != "n" && "$Y_N" != "N" ]]; do
  read -rp "Backup the current database (Y/N)? " Y_N
  if [[ "$Y_N" == "y" || "$Y_N" == "Y" ]]; then
    echo "  Backing up the current database..."
    NOW=$(date +"%m-%d-%y-%H-%M")
    BACKUP_FILE="$HOME/FarmData2/docker/db.$NOW.tar.gz"

    sudo tar czvf "$BACKUP_FILE" ./* > /dev/null
    error_check

    echo "    Current database backed up to $BACKUP_FILE"
    echo "    Use the following to restore:"
    echo "      docker stop fd2_postgres"
    echo "      sudo chmod g+rwx $HOME/FarmData2/docker/db"
    echo "      cd $HOME/FarmData2/docker/db"
    echo "      sudo rm -rf ./*"
    echo "      sudo tar -xzf $BACKUP_FILE"
    echo "      docker start fd2_postgres"

    break
  else
    echo "  Current database not backed up."
  fi
done

# Delete the current database.
echo "Deleting current databae..."
safe_cd "$HOME/FarmData2/docker/db"
sudo rm -rf ./*
error_check
echo "  Deleted."

# Bring the farmOS container back up.
echo "Bringing the farmos container back up..."
docker start fd2_farmos > /dev/null
error_check
sleep 5
echo "  Up."

# Bring the database container back up.
echo "Bringing the database container back up..."
docker start fd2_postgres > /dev/null
error_check
sleep 5
echo "  Up."

# Reset the drupal settigns.php file
echo "Resetting the drupal settings.php file..."
docker exec -it fd2_farmos rm /opt/drupal/web/sites/default/settings.php 
error_check
docker exec -it fd2_farmos cp /opt/drupal/web/sites/default/default.settings.php /opt/drupal/web/sites/default/settings.php
error_check
docker exec -it fd2_farmos chown www-data /opt/drupal/web/sites/default/settings.php 
error_check
docker exec -it fd2_farmos chgrp www-data /opt/drupal/web/sites/default/settings.php
error_check
sleep 10
echo "  Reset."

# Doing farmOS Configure Site
echo "Configuring the farmOS site..."
safe_cd "$REPO_DIR"
npx cypress run --spec=src/baseDB/farmOS.configBaseDB.cy.js
error_check
echo "  Configured." 

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
DIST_FILE="$REPO_DIR/dist/db.base.tar.gz"
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

echo -e "${UNDERLINE_GREEN}Base (empty) database has been built.${NO_COLOR}"