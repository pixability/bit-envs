#!/usr/bin/env node

// we have to do it this way because jest uses the import-local to wrap around
// this functionality
// a side-effect of which being that jest will always run from the
// author/consumer environment rather than the jest environment if we don't use
// this executable
require(`jest-cli/build/cli`).run()
