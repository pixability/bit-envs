#!/bin/bash
npm install
npm run build
bit import
bit tag --all
bit remote add ssh://root@scope:22:/tmp/scope
bit remote add ssh://root@scope:22:/tmp/bit.test-envs
