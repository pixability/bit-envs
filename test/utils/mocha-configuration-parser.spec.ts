import { expect } from 'chai'
import {
  mochaConfigurationParser
} from '../../src/find-configuration/mocha-configuration-parser'

const emptyInfo = {
  configFiles: [],
  context: {}
}

describe('mocha configuration-parser', function () {
  it('supports all basic options', function () {
    const rawConfig = [
      '--bail',
      '# I am a comment',
      '--grep foo',
      '--slow 12',
      '--timeout 1000',
      '--retries 42'
    ].join('\n')
    const parsed = mochaConfigurationParser(rawConfig, emptyInfo)
    expect(parsed).to.deep.equal({
      bail: true,
      grep: 'foo',
      retries: '42',
      slow: '12',
      timeout: '1000'
    })
  })
  it('supports requires when they are in info.configFiles', function () {
    const rawConfig = [
      '--bail',
      '# I am a comment',
      '--grep foo',
      '--slow 12',
      '--timeout 1000',
      '--retries 42',
      '--require ./foo.js'
    ].join('\n')
    const parsed = mochaConfigurationParser(
      rawConfig,
      Object.assign({}, emptyInfo, { configFiles: [{ relative: './foo.js' }] })
    )
    expect(parsed).to.deep.equal({
      bail: true,
      grep: 'foo',
      retries: '42',
      slow: '12',
      timeout: '1000',
      mochaRequire: './foo.js'
    })
  })
  it('supports global requires not in info.configFiles', function () {
    const rawConfig = [
      '--bail',
      '# I am a comment',
      '--grep foo',
      '--slow 12',
      '--timeout 1000',
      '--retries 42',
      '--require left-pad'
    ].join('\n')
    const parsed = mochaConfigurationParser(rawConfig, emptyInfo)
    expect(parsed).to.deep.equal({
      bail: true,
      grep: 'foo',
      retries: '42',
      slow: '12',
      timeout: '1000',
      mochaRequire: 'left-pad'
    })
  })
  it('throws when require flags not in info.configFiles', function () {
    const rawConfig = [
      '--bail',
      '# I am a comment',
      '--grep foo',
      '--slow 12',
      '--timeout 1000',
      '--require ./foo.js',
      '--retries 42'
    ].join('\n')
    expect(() => mochaConfigurationParser(rawConfig, emptyInfo)).to.throw(
      /add \.\/foo\.js to the files field in the tester configuration/
    )
  })
  it('throws when requiring absolute paths', function () {
    const rawConfig = [
      '--bail',
      '# I am a comment',
      '--grep foo',
      '--slow 12',
      '--timeout 1000',
      '--require /path/to/my/foo.js',
      '--retries 42'
    ].join('\n')
    const info = Object.assign(
      {}, emptyInfo, { configFiles: [{ relative: './foo.js' }] }
    )
    expect(() => mochaConfigurationParser(rawConfig, info)).to.throw(
      /use relative path for \/path\/to\/my\/foo\.js/
    )
  })
  it('silently discards unsupported options', function () {
    const rawConfig = [
      '--bail',
      '# I am a comment',
      '--grep foo',
      '--slow 12',
      '--timeout 1000',
      '--retries 42',
      '--killAllHumans true'
    ].join('\n')
    const parsed = mochaConfigurationParser(rawConfig, emptyInfo)
    expect(parsed).to.deep.equal({
      bail: true,
      grep: 'foo',
      retries: '42',
      slow: '12',
      timeout: '1000'
    })
  })
})
