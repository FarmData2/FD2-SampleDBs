# Script that can be sourced at the start of other scripts
# to setup some useful variables, import some useful libraries
# and to check that necessary conditions hold. 

# shellcheck disable=SC1091  # Make sources okay.

SCRIPT_PATH=$(readlink -f "$0")             # Path to this script.
# shellcheck disable=SC2034
SCRIPT_DIR=$(dirname "$SCRIPT_PATH")        # Path to directory containing this script.
REPO_DIR=$(git rev-parse --show-toplevel)   

source "$REPO_DIR/bin/colors.bash"
source "$REPO_DIR/bin/lib.bash"

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