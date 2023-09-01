# Checks if prior operation succeeded and terminates if not.
# Used throughout to avoid continuing if an operation fails.
function error_check {
  if [ "$?" != "0" ]; then
    echo "** Terminating: Error in previous command."
    exit 255
  fi
}

# Do a cd with error handling for a directory that is missing but
# should be present.
function safe_cd {
  cd "$1" 2> /dev/null || (
    echo -e "${ON_RED}ERROR:${NO_COLOR} Directory $1 is missing."
    echo -e "Restore this directory and try again."
    exit 255
  ) || exit 255
}
