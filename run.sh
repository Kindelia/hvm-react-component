#!/bin/bash

pwd="$(dirname "$0")/.."
[[ -n $1 ]] && file=$1 || file=Apps/Demo/_
wikind=$pwd/Wikind
hrc=$pwd/hvm-react-component
cd "$wikind" || exit

modify() {
kind2 to-hvm $file.kind2 > "$hrc/hvm/$(basename $file)".hvm
sed -n '1,8p' "$hrc/src/index-demo.js" > "$hrc/src/index.js"
cat "$hrc/hvm/$(basename $file).hvm" >> "$hrc/src/index.js"
sed -n '62,65p' "$hrc/src/index-demo.js" >> "$hrc/src/index.js"
}


while true ;do
watch -d -t -g ls -lR "$pwd/Wikind/$file.kind2"  && modify
done

# kill with `killall run.sh` on another terminal
