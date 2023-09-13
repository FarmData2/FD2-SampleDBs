#!/bin/bash
# shellcheck disable=SC1091  # Make sources okay.

SCRIPT_PATH=$(readlink -f "$0")       # Path to this script.
SCRIPT_DIR=$(dirname "$SCRIPT_PATH")  # Path to directory containing this script.
REPO_DIR=$(dirname "$SCRIPT_DIR")     # Path to the main repo directory      

source "$SCRIPT_DIR/colors.bash"
source "$SCRIPT_DIR/lib.bash"

# Ensure that this script is being run in the development container.
HOST=$(docker inspect -f '{{.Name}}' "$HOSTNAME" 2> /dev/null)
if [ ! "$HOST" == "/fd2_dev" ]; then
  echo -e "${RED}ERROR:${NO_COLOR} The installDB.bash script must be run in the fd2dev container."
  exit 255
fi

# Ensure that the FarmData2 repository exits
if [ ! -d "$HOME/FarmData2" ]; then
  echo -e "${RED}ERROR:${NO_COLOR} The FarmData2 repository must be in /home/fd2dev/FarmData2".
  exit 255
fi

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
  AVAILABLE_DB=$(ls "$REPO_DIR/dist")
  if [ "$AVAILABLE_DB" == "" ]; then
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

echo "Restarting Postgres..."
docker start fd2_postgres > /dev/null
error_check
echo "  Started."

echo "Restarting farmOS..."
docker start fd2_farmos > /dev/null
error_check
echo "  Started."

echo -e "${UNDERLINE_GREEN}Installed the $DB database${NO_COLOR}"