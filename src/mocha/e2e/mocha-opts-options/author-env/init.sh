#!/bin/bash
bit init
bit remote add ssh://root@scope:22:/tmp/scope
bit remote add ssh://root@scope:22:/tmp/bit.test-envs
bit add index.js --main index.js --id sum
bit add add.js --main index.js --id sum
bit add sub.js --main index.js --id sum
bit add setup.js --main index.js --id sum
bit add -t test.spec.js --id sum
bit add -t other-test.spec.js --id sum
