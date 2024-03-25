# Copy and adapt the libraries from FarmData2
# that are used to create the sample databases.

# shellcheck disable=SC1091  # Make sources okay.

REPO_DIR=$(git rev-parse --show-toplevel)     
source "$REPO_DIR/bin/lib.bash"

FD2_DIR="$HOME/FarmData2"

echo "Building the FarmData2 libraries..."

echo "  Checking for the FarmData2 repo..."
while [ ! -d $FD2_DIR ];
do
  echo "    Directory $FD2_DIR not found."
  read -r -p "    Enter path to the FarmData2 repo: " FD2_DIR
done
echo "    Using the FarmData2 repo at: $FD2_DIR"

safe_cd "$REPO_DIR/src/library"

# Get the farmosUtil library
echo "  Copying farmosUtil to $PWD/farmosUtil/..."
rm -rf farmosUtil
error_check "    Unable to remove existing farmosUtil directory." 
mkdir farmosUtil
error_check "    Unable to create new farmosUtil directory."
cp "$FD2_DIR/library/farmosUtil/farmosUtil.js" farmosUtil/
error_check "    Unable to copy farmosUtil.js FarmData2 repo."
echo "  Copied."

# Get the traySeeding library
echo "  Copying tray_seeding/lib.js to $PWD/traySeeding/..."
rm -rf traySeeding
error_check "    Unable to remove existing traySeeding directory." 
mkdir traySeeding
error_check "    Unable to create new traySeeding directory."
cp "$FD2_DIR/modules/farm_fd2/src/entrypoints/tray_seeding/lib.js" traySeeding/
error_check "    Unable to copy tray_seeding/lib.js FarmData2 repo."
sed -i "s/@libs\/farmosUtil\/farmosUtil/..\/farmosUtil\/farmosUtil.js/g" "traySeeding/lib.js"
error_check "    Unable to update farmosUtil import."
echo "  Copied."

# Get the directSeeding library
echo "  Copying direct_seeding/lib.js to $PWD/directSeeding/..."
rm -rf directSeeding
error_check "    Unable to remove existing directSeeding directory." 
mkdir directSeeding
error_check "    Unable to create new directSeeding directory."
cp "$FD2_DIR/modules/farm_fd2/src/entrypoints/direct_seeding/lib.js" directSeeding/
error_check "    Unable to copy direct_seeding/lib.js FarmData2 repo."
sed -i "s/@libs\/farmosUtil\/farmosUtil/..\/farmosUtil\/farmosUtil.js/g" "directSeeding/lib.js"
error_check "    Unable to update farmosUtil import."
echo "  Copied."

echo "Built."
