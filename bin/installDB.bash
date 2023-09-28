#!/bin/bash
# shellcheck disable=SC1091  # Make sources okay.

# Define some useful variables, import libraries and 
# check some common pre-conditions.
REPO_DIR=$(git rev-parse --show-toplevel)       
source "$REPO_DIR/bin/preflight.bash"

# Determine the database to be installed.
if [ ! "$1" == "" ]; then
  # DB was specified on the command line.
  if [ ! -f "$REPO_DIR/dist/$1" ]; then
    echo -e "${RED}ERROR:${NO_COLOR} The file $REPO_DIR/dist/$1 does not exist."
    exit 255
  else
    DB="$1"
  fi
else
  # Pick the database to be installed
  # shellcheck disable=SC2207
  AVAILABLE_DB=( $(ls "$REPO_DIR/dist" ))
  if [ ${#AVAILABLE_DB[@]} == 0 ]; then
    echo -e "${RED}ERROR:${NO_COLOR} No db.X.tar.gz files found in dist."
    echo -e "${RED}ERROR:${NO_COLOR} Build a database (e.g. base, sample) before installing."
    exit 255
  fi
  echo "Choose the database to be installed."
  select DB in "${AVAILABLE_DB[@]}"; do
    if (("$REPLY" <= 0 || "$REPLY" > "${#AVAILABLE_DB[@]}")); then
      echo -e "${ON_RED}ERROR:${NO_COLOR} Invalid choice. Please try again."
    else
      break
    fi
  done
  echo ""
fi

echo -e "${UNDERLINE_GREEN}Installing the $DB database${NO_COLOR}"

echo "Stopping farmOS..."
docker stop fd2_farmos > /dev/null
error_check
echo "  Stopped."

echo "Stopping Postgres..."
docker stop fd2_postgres > /dev/null
error_check
echo "  Stopped."

# Make sure that the FarmData2/docker/db directory has appropriate permissions.
echo "Setting permissions on $HOME/FarmData2/docker/db..."
sudo chmod g+rwx "$HOME/FarmData2/docker/db"
error_check
sudo chgrp fd2dev "$HOME/FarmData2/docker/db"
error_check
echo "  Set."

safe_cd "$HOME/FarmData2/docker/db"

echo "Deleting current databae..."
sudo rm -rf ./*
error_check
echo "  Deleted."

echo "Extracting $DB..."
sudo tar -xzf "$REPO_DIR/dist/$DB" > /dev/null
error_check
echo "  Extracted."

echo "Removing farmOS tokens..."
rm -rf "$REPO_DIR/scratch"
echo "Removed."

echo "Restarting Postgres..."
docker start fd2_postgres > /dev/null
error_check
STATUS=$(docker exec fd2_postgres pg_isready)
while [[ ! "$STATUS" == *"accepting connections"* ]]; do
  STATUS=$(docker exec fd2_postgres pg_isready)
done
echo "  Started."

echo "Restarting farmOS..."
docker start fd2_farmos > /dev/null
error_check
echo "  Started."

echo -e "${UNDERLINE_GREEN}Installed the $DB database${NO_COLOR}"