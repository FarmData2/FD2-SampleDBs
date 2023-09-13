#!/bin/bash
# shellcheck disable=SC1091  # Make sources okay.

# Define some useful variables, import libraries and 
# check some common pre-conditions.
REPO_DIR=$(git rev-parse --show-toplevel)       
source "$REPO_DIR/bin/preflight.bash"

echo "Setting farm info..."

echo "  Setting the farm name..."
docker exec -it fd2_farmos drush config-set system.site name "Sample Farm" -y
error_check
echo "    Set."

echo "  Setting the farm slogan..."
docker exec -it fd2_farmos drush config-set system.site slogan "Farm with sample data for development and testing." -y
error_check
echo "    Set."

echo "Farm info set."