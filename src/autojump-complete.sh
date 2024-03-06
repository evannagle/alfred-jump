#!/bin/bash

[ -f $AUTOJUMP_SH ] && . $AUTOJUMP_SH

src_dir="$(dirname "$0")"

$NODE_BIN "$src_dir/complete-autojumps.js" "$1" "$AUTOJUMP_BIN"