const path = require('path')
const { test, startup, cleanup } = require('../../../test/e2e-test-setup')

const fixtureFolder = fixtureName => path.join(
  __dirname, fixtureName
)

test('can use component with mocha tester', async t => {
  const fixtureName = 'base-case'
  try {
    const {
      loginToken,
      runInPublisher,
      runInAuthor,
      runInConsumer
    } = await startup(fixtureFolder(fixtureName))
    const publisherTestResult = await runInPublisher([
      `bit config set user.token ${loginToken}`,
      'bit build',
      'bit test testers/mocha',
      'bit tag --all --skip-tests'
    ])
    const authorTestResult = await runInAuthor([
      'bit test',
      'bit tag --all --skip-tests',
      'bit export scope sum'
    ])
    const consumerTestResult = await runInConsumer([
      'bit import scope/sum',
      'bit test -a'
    ])
    const publisherResultString = publisherTestResult.join('')
    const authorResultString = authorTestResult.join('')
    const consumerResultString = consumerTestResult.join('')
    const publisherTestsSucceeded = (
      /tests passed/.test(publisherResultString) &&
      !/tests failed/.test(publisherResultString)
    )
    const publishSucceeded = /tagged/.test(publisherResultString)
    const authorTestsSucceeded = (
      /tests passed/.test(authorResultString) &&
      !/tests failed/.test(authorResultString)
    )
    const authorPublishSucceeded = /exported/.test(authorResultString)
    const consumerTestsSucceeded = (
      /tests passed/.test(consumerResultString) &&
      !/tests failed/.test(consumerResultString)
    )
    t.ok(publisherTestsSucceeded, 'tests passed in the publisher environment')
    t.ok(publishSucceeded, 'published test environment successfully')
    t.ok(authorTestsSucceeded, 'tests passed in author environment')
    t.ok(authorPublishSucceeded, 'published component with tester successfully')
    t.ok(consumerTestsSucceeded, 'tests passed in consumer environment')
    await cleanup(fixtureFolder(fixtureName))
    t.end()
  } catch (e) {
    console.error(e.message)
    t.fail(e.message)
    await cleanup(fixtureFolder(fixtureName))
  }
})

test('can use component having mocha.opts with mocha tester', async t => {
  const fixtureName = 'mocha-opts-options'
  try {
    const {
      loginToken,
      runInPublisher,
      runInAuthor,
      runInConsumer
    } = await startup(fixtureFolder(fixtureName))
    const publisherTestResult = await runInPublisher([
      `bit config set user.token ${loginToken}`,
      'bit build',
      'bit test testers/mocha',
      'bit tag --all --skip-tests'
    ])
    const authorTestResult = await runInAuthor([
      'bit test',
      'bit tag --all --skip-tests',
      'bit export scope sum'
    ])
    const consumerTestResult = await runInConsumer([
      'bit import scope/sum',
      'bit test -a'
    ])
    const publisherResultString = publisherTestResult.join('')
    const authorResultString = authorTestResult.join('')
    const consumerResultString = consumerTestResult.join('')
    const publisherTestsSucceeded = (
      /tests passed/.test(publisherResultString) &&
      !/tests failed/.test(publisherResultString)
    )
    const publishSucceeded = /tagged/.test(publisherResultString)
    const authorTestsSucceeded = (
      /tests passed/.test(authorResultString) &&
      !/tests failed/.test(authorResultString)
    )
    const authorPublishSucceeded = /exported/.test(authorResultString)
    const consumerTestsSucceeded = (
      /tests passed/.test(consumerResultString) &&
      !/tests failed/.test(consumerResultString)
    )
    t.ok(publisherTestsSucceeded, 'tests passed in the publisher environment')
    t.ok(publishSucceeded, 'published test environment successfully')
    t.ok(authorTestsSucceeded, 'tests passed in author environment')
    t.ok(authorPublishSucceeded, 'published component with tester successfully')
    t.ok(consumerTestsSucceeded, 'tests passed in consumer environment')
    await cleanup(fixtureFolder(fixtureName))
    t.end()
  } catch (e) {
    console.error(e.message)
    t.fail(e.message)
    await cleanup(fixtureFolder(fixtureName))
  }
})
