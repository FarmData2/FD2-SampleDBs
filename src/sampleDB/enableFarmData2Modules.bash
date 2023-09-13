#!/bin/bash
# shellcheck disable=SC1091  # Make sources okay.

# Define some useful variables, import libraries and 
# check some common pre-conditions.
REPO_DIR=$(git rev-parse --show-toplevel)       
source "$REPO_DIR/bin/preflight.bash"

echo "Enabling FarmData2 modules..."

echo "  Enabling farm_fd2..."
docker exec -it fd2_farmos drush en farm_fd2 -y
error_check
echo "    Enabled."

echo "  Enabling farm_fd2_examples..."
docker exec -it fd2_farmos drush en farm_fd2_examples -y
error_check
echo "    Enabled."

echo "  Enabling farm_fd2_school..."
docker exec -it fd2_farmos drush en farm_fd2_school -y
error_check
echo "    Enabled."

echo "FarmData2 modules enabled."