# Create sym links to the libraries in FarmData2
# that are used to create the sample databases.

# shellcheck disable=SC1091  # Make sources okay.

REPO_DIR=$(git rev-parse --show-toplevel)     
source "$REPO_DIR/bin/lib.bash"

FD2_DIR="$HOME/FarmData2"

echo "Linking FarmData2 libraries..."

echo "  Checking for FarmData2 directory..."
while [ ! -d $FD2_DIR ];
do
  echo "    Directory $FD2_DIR not found."
  read -r -p "    Enter path to FarmData2: " FD2_DIR
done
echo "    Using FarmData2 directory at: $FD2_DIR"

safe_cd "$REPO_DIR/src/library"

LINKS=(
  'library/farmosUtil' 
  'modules/farm_fd2/src/entrypoints/tray_seeding'
  'modules/farm_fd2/src/entrypoints/direct_seeding'
)

for LINK in "${LINKS[@]}";
do
  echo "  Linking $LINK in $PWD..."
  LINK_NAME="$(basename $LINK)"
  rm -f "$LINK_NAME"
  error_check "    Unable to remove existing $LINK_NAME link." 
  ln -s "$FD2_DIR/$LINK" "$LINK_NAME"
  error_check "    Unable to create $LINK_NAME link to $FD2_DIR/$LINK."
  echo "  Linked."
done




