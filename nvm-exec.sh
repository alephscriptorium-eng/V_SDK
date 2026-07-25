#!/bin/bash
# Script to execute npm/node commands with nvm loaded
# Usage: ./nvm-exec.sh <command>

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Use the default node version
nvm use node > /dev/null 2>&1

# Execute the command passed as arguments
exec "$@"