import * as fs from 'fs'
import * as path from 'path'
import * as url from 'url'
import { append, end, start, type Document } from './index.js'

describe('parse', () => {
  const documentCasesPath = path.join(
    path.dirname(url.fileURLToPath(import.meta.url)),
    'submodules',
    'skitscript',
    'parser-test-suite',
    'document-cases'
  )

  const caseNames = fs.readdirSync(documentCasesPath)

  for (const caseName of caseNames) {
    describe(caseName, () => {
      for (const newline of ['\n', '\r', '\r\n']) {
        describe(`with a newline of ${JSON.stringify(newline)}`, () => {
          let document: Document

          beforeAll(async () => {
            const source = await fs.promises.readFile(
              path.join(documentCasesPath, caseName, 'input.skitscript'),
              'utf8'
            )

            const parser = start()

            for (const character of source.replace(/\n/g, newline)) {
              append(parser, character)
            }

            document = end(parser)
          })

          it('parses to the expected document', async () => {
            const outputText = await fs.promises.readFile(
              path.join(documentCasesPath, caseName, 'output.json'),
              'utf8'
            )
            const output = JSON.parse(outputText)

            expect(document).toEqual(output)
          })
        })
      }
    })
  }

  it('throws an error when appending to an ended parser', () => {
    const parser = start()
    append(parser, 'h')
    append(parser, 'e')
    append(parser, 'l')
    append(parser, 'l')
    append(parser, 'o')
    end(parser)

    expect(() => {
      append(parser, 'w')
    }).toThrowError('Unable to append to a parser which has ended.')
  })

  it('throws an error when ending an ended parser', () => {
    const parser = start()
    append(parser, 'h')
    append(parser, 'e')
    append(parser, 'l')
    append(parser, 'l')
    append(parser, 'o')
    end(parser)

    expect(() => {
      end(parser)
    }).toThrowError('Unable to end the same parser more than once.')
  })
})
