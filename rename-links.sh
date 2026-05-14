#!/bin/sh

find docs -name '*.html' |
while read f; do
	cat "$f" | sed 's/_%3b"/"/g' | sed 's/_%3b?/?/g' > "tmp.html"
    mv "tmp.html" "$f"
done
