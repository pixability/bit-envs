#!/bin/bash
rm -rf .bit
rm .bitmap
bit init
bit remote add ssh://root@scope:22:/tmp/scope
bit remote add ssh://root@scope:22:/tmp/bit.test-envs
