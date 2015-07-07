#!/bin/bash

CIENGINE="appveyor"
if [[ $TRAVIS = true ]]
then
  echo "The TRAVIS_COMMIT variable has a value of - ${TRAVIS_COMMIT}"
  CIENGINE="travis"
  brew update 2>&1 1> "brewupdate.log"
  brew install jq 2>&1 1> "brewinstall.log"
  echo "About to run: curl https://api.github.com/repos/swara-app/swara-server/commits/${TRAVIS_COMMIT} | jq -r '.commit.message'"
  APPVEYOR_REPO_COMMIT_MESSAGE=$(curl -u ${GH_TOKEN}:x-oauth-basic https://api.github.com/repos/swara-app/swara-server/commits/$TRAVIS_COMMIT | jq -r '.commit.message')
elif [[ $WERCKER = true ]]
then
  echo "The WERCKER_GIT_COMMIT variable has a value of - ${WERCKER_GIT_COMMIT}"
  CIENGINE="wercker"
  wget "http://stedolan.github.io/jq/download/linux64/jq"
  chmod +x jq
  echo "About to run: curl https://api.github.com/repos/swara-app/swara-server/commits/${WERCKER_GIT_COMMIT} | jq -r '.commit.message'"
  APPVEYOR_REPO_COMMIT_MESSAGE=$(curl -u ${GH_TOKEN}:x-oauth-basic https://api.github.com/repos/swara-app/swara-server/commits/$WERCKER_GIT_COMMIT | ./jq -r '.commit.message')
else
  wget "http://stedolan.github.io/jq/download/linux64/jq"
fi

echo "CI Server      : ${CIENGINE}."
echo "Commit Message : '${APPVEYOR_REPO_COMMIT_MESSAGE}'"

if [[ $APPVEYOR_REPO_COMMIT_MESSAGE != *\[deploy\]* ]]
then
  echo 'There is nothing to deploy here. Moving on!';
  exit
fi

echo "Beginning Deploy..."

git config --global user.name "The CI Bot"
git config --global user.email "swara.app@gmail.com"

VERSION==$(cat package.json | jq -r '.version')
DEPLOYVERSION="deploy-${VERSION}"

echo "Version being deployed is ${VERSION} and the branch to which it will be deployed is ${DEPLOYVERSION}"

# wercker seems to be cloning to /pipeline/source
THISREPOCLONEDIR="swara-server"
if [[ $WERCKER = true ]]
then
  THISREPOCLONEDIR="source"
fi

cd ..
git clone https://github.com/swara-app/swara-server.git swara-server-releases
cd swara-server-releases
git config credential.helper "store --file=.git/swara-credentials"
echo "https://${GH_TOKEN}:@github.com" > .git/swara-credentials
git config push.default tracking
git checkout -b ${DEPLOYVERSION}
cp -r ../${THISREPOCLONEDIR}/releases/* ./releases
git add -f ./releases/
git commit -m "created release ${VERSION} ($CIENGINE) [skip ci]" -s
git ls-remote --heads origin | grep ${DEPLOYVERSION} && git pull --rebase origin ${DEPLOYVERSION}
git ls-remote --heads origin | grep ${DEPLOYVERSION} && git push origin ${DEPLOYVERSION} || git push -u origin ${DEPLOYVERSION}

echo "Deployed $VERSION successfully to the branch named '${DEPLOYVERSION}'"
exit
