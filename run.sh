#!/bin/bash

header="import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const main = 'Apps.Demo';
const code = \`"

footer="\`;
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App main={main} code={code} />);"

help(){
  echo "-f: file #Default: Apps/Demo/_
  -1: run one time
  -s: start develop mode, build at every modification
  -q: finish develop mode #run on another terminal"
}

modify() {
[[ -z $file ]] && file=Apps/Demo/_
kind2 to-hvm $file.kind2 &> "$hrc/hvm/$(basename $file)".hvm
echo "$header" > "$hrc/src/index.js"
cat "$hrc/hvm/$(basename $file).hvm" >> "$hrc/src/index.js"
echo "$footer" >> "$hrc/src/index.js"
 }

pwd="$(dirname "$0")/.."
wikind=$pwd/Wikind
hrc=$pwd/hvm-react-component
cd "$wikind" || exit

while getopts "hf:1sq" OPT; do
case "$OPT" in
"h") help;;
"f") file=$OPTARG;;
"1") modify;;
"s")
  while true ;do
  watch -d -t -g ls -lR "$pwd/Wikind/$file.kind2"  && modify
  done
  ;;
"q") killall "$(basename $0)";;
esac
done

[[ -z "$1" ]] && help

# kill with `killall run.sh` on another terminal
