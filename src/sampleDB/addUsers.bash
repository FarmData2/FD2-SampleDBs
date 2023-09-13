#!/bin/bash
# shellcheck disable=SC1091  # Make sources okay.

# Define some useful variables, import libraries and 
# check some common pre-conditions.
REPO_DIR=$(git rev-parse --show-toplevel)       
source "$REPO_DIR/bin/preflight.bash"

echo "Adding 'People' and assigning Roles..."

echo "  Assigning roles to existing admin user..."
docker exec -it fd2_farmos drush user:role:add "farm_manager" "admin"
error_check
docker exec -it fd2_farmos drush user:role:add "farm_worker" "admin"
error_check
docker exec -it fd2_farmos drush user:role:add "farm_viewer" "admin"
error_check
echo "  Assigned"

echo "  Creating the Farm Manager users..."
for i in {1..2}
do
    docker exec -it fd2_farmos drush user:create "manager$i" --password="farmdata2"
    error_check
    docker exec -it fd2_farmos drush user:role:add "farm_manager" "manager$i"
    error_check
    docker exec -it fd2_farmos drush user:role:add "farm_worker" "manager$i"
    error_check
    docker exec -it fd2_farmos drush user:role:add "farm_viewer" "manager$i"
    error_check
    echo ""
done
echo "  Created."

echo "  Creating the Farm Worker users..."
for i in {1..5}
do
    docker exec -it fd2_farmos drush user:create "worker$i" --password="farmdata2"
    error_check
    docker exec -it fd2_farmos drush user:role:add "farm_worker" "worker$i"
    error_check
    docker exec -it fd2_farmos drush user:role:add "farm_viewer" "worker$i"
    error_check
    echo ""
done
echo "  Created."

# Create the guest
echo "  Creating the guest user..."
docker exec -it fd2_farmos drush user:create "guest" --password="farmdata2"
error_check
docker exec -it fd2_farmos drush user:role:add "farm_viewer" "guest"
error_check
echo "  Created."

# Create the user that will be allowed to login with basic authentication
# This username must begin with restws (see: https://www.drupal.org/node/3016570)
#docker exec -it fd2_farmos drush user-create "restws1" --password="farmdata2"
#docker exec -it fd2_farmos drush urol "Farm Manager" --name="restws1"
#docker exec -it fd2_farmos drush urol "Farm Worker" --name="restws1"
#docker exec -it fd2_farmos drush urol "Farm Viewer" --name="restws1"
#echo ""

echo "People created and Roles assigned."
