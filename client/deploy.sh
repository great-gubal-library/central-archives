#!/bin/bash
SSH_SERVER=`cat server.txt`
REMOTE_DIR=/var/www/chaosarchives

echo "Copying files to server"
rsync -rlptv -e ssh --delete dist/spa/ $SSH_SERVER:$REMOTE_DIR
