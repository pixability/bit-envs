#!/bin/bash
bit init
bit remote add ssh://root@scope:22:/tmp/scope
bit remote add ssh://root@scope:22:/tmp/bit.test-envs
bit add sum.js --id sum
bit add -t sum.spec.js --id sum
