#!/bin/sh

find docs -name '*.*_;' |
while read f; do
    mv "$f" "${f%_;}"
done
