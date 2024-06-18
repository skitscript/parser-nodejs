import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'
import { identifierIsValid } from '../index.js'

describe('identifierIsValid', () => {
  const identifierCasesPath = path.join(
    path.dirname(url.fileURLToPath(import.meta.url)),
    '..',
    'submodules',
    'skitscript',
    'parser-test-suite',
    'identifier-cases'
  )

  describe('valid', () => {
    const cases = fs.readFileSync(
      path.join(identifierCasesPath, 'valid.txt'),
      'utf8'
    )

    for (const line of cases.split('\n')) {
      if (line.trim() !== '') {
        it(JSON.stringify(line), () => {
          expect(identifierIsValid(line)).toBeTrue()
        })
      }
    }
  })

  describe('invalid', () => {
    const cases = fs.readFileSync(
      path.join(identifierCasesPath, 'invalid.txt'),
      'utf8'
    )

    for (const line of cases.split('\n')) {
      it(JSON.stringify(line), () => {
        expect(identifierIsValid(line)).toBeFalse()
      })
    }
  })
})
