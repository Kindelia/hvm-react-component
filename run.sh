#!/bin/bash

pwd=$(dirname $0)/..
[[ -n $1 ]] && file=$1 || file=Apps/Demo/_
cd $pwd/Wikind

modify() {
kind2 to-hvm $file.kind2 > $pwd/$(basename $file).hvm
sed -n '1,8p' $pwd/hvm-react-component/src/index-demo.js > $pwd/hvm-react-component/src/index.js
cat $pwd/$(basename $file).hvm >> $pwd/hvm-react-component/src/index.js
sed -n '62,65p' $pwd/hvm-react-component/src/index-demo.js >> $pwd/hvm-react-component/src/index.js
}


while true ;do
watch -d -t -g ls -lR $pwd/Wikind/$file.kind2  && modify
done

# kill with `killall run.sh` on another terminal
