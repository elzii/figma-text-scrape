#!/usr/bin/env bash

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"
DIST_DIR=$SCRIPT_DIR/dist
BIN_DIR=$SCRIPT_DIR/bin
BIN_NAME='figma-scrape-text'
BIN=$BIN_DIR/$BIN_NAME

cp $DIST_DIR/index.js $BIN_DIR/$BIN_NAME

# cat "$BIN_DIR/figma-scrape-text" | sed -E '1s/^/\#\!/usr/bin/env bash\n/'
echo -e "#!/usr/bin/env bash\n$(cat $BIN)" > $BIN
chmod +x $BIN

>&2 echo -e "Moving 'dist/$(basename "$DIST_DIR/index.js")' to 'bin/$(basename "$BIN")' and made it executable"
>&2 echo -e "Validating....\n"

if [[ `cat $BIN | head -n 1 | egrep -Eq '^\#\!\/usr\/bin\/env node$'; echo $?` -eq 0 ]]; then
  >&2 echo -e "✅ \033[32mSUCCESS\033[39m"
else
  >&2 echo -e "❌ \033[31mERROR\033[39m"
fi

>&2 echo -ne "\033[0m"
