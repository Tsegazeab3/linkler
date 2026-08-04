#!/bin/bash

PACKAGES="fastapi chromadb chroma-hnswlib hf-xet huggingface_hub kubernetes sympy mpmath typer"

pip uninstall -y $PACKAGES

for pkg in $PACKAGES; do
    sed -i.bak -E "/^${pkg}([=>~<].*)?$/Id" requirements.txt 2>/dev/null || \
    sed -i '' -E "/^${pkg}([=>~<].*)?$/Id" requirements.txt 2>/dev/null
done

rm -f requirements.txt.bak
