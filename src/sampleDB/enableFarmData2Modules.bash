#!/bin/bash
# shellcheck disable=SC1091  # Make sources okay.

# Define some useful variables, import libraries and 
# check some common pre-conditions.
REPO_DIR=$(git rev-parse --show-toplevel)       
source "$REPO_DIR/bin/preflight.bash"

echo "Enabling FarmData2 modules..."

echo "  Enabling the farmOS Simple Auth Password Grant Module..."
docker exec -it fd2_farmos drush en simple_oauth_password_grant -y
error_check
echo "  Enabled."

echo "  Enabling the farmOS Default API Consumer Module..."
docker exec -it fd2_farmos drush en farm_api_default_consumer -y
error_check
echo "  Enabled."

echo "  Enabling the farmOS Inventory Module..."
docker exec -it fd2_farmos drush en farm_inventory -y
error_check
echo "  Enabled."

echo "  Enabling the Drupal Views UI Module..."
docker exec -it fd2_farmos drush en views_ui -y
error_check
echo "  Enabled."

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

echo "  Clearing Drupal cache..."
clearDrupalCache.bash
error_check
echo "  Cleared."

echo "FarmData2 modules enabled."