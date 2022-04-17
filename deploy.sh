#!/bin/sh

export BUILD_CMD="pnpm build:app"
export LOCAL_BUILD_DIR="dist/"
export REMOTE_ORIGIN="origin"
export BRANCH='pages'
export REPO_URL='https://github.com/iCorale/redditMatrix.git'
export COMMIT_MESSAGE="deploy"

set -e
rm -rf $LOCAL_BUILD_DIR
eval $BUILD_CMD
cd $LOCAL_BUILD_DIR
cp index.html 404.html
touch .nojekyll
git init -b $BRANCH
git config user.name "iCorale"
git remote add origin $REPO_URL
git add .
git commit -m $COMMIT_MESSAGE
git push -u $REMOTE_ORIGIN $BRANCH --force
