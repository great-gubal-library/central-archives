#!/bin/bash
SSH_SERVER=`cat server.txt`
REMOTE_DIR=/var/www/harborwatch

echo "Copying files to server"
rsync -rlptv -e ssh --delete dist/spa/ $SSH_SERVER:$REMOTE_DIR
