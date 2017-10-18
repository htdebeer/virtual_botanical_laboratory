#!/bin/bash
# Generate the documentation for virtual_botanical_laboratory.
#
# This uses the program "pandocomatic". See
# https://heerdebeer.org/Software/markdown/pandocomatic/ about installing
# pandocomatic.

cd documentation;

pandocomatic \
    --data-dir data-dir \
    --config config.yaml \
    --input manual.md \
    --output ../index.md

pandocomatic \
    --data-dir data-dir \
    --config config.yaml \
    --input README.md \
    --output ../README.md

