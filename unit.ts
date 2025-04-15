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
      for (const newlineBytes of [[10], [13], [13, 10], [32, 10], [32, 13], [32, 13, 10]]) {
        describe(`with a newline of ${JSON.stringify(newlineBytes)}`, () => {
          let document: Document

          beforeAll(async () => {
            const source = await fs.promises.readFile(
              path.join(documentCasesPath, caseName, 'input.skitscript')
            )

            const parser = start()

            for (const byte of source) {
              if (byte === 10) {
                for (const newlineByte of newlineBytes) {
                  append(parser, newlineByte)
                }
              } else {
                append(parser, byte)
              }
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
    append(parser, 104)
    append(parser, 101)
    append(parser, 108)
    append(parser, 108)
    append(parser, 111)
    end(parser)

    expect(() => {
      append(parser, 119)
    }).toThrowError('Unable to append to a parser which has ended.')
  })

  it('throws an error when ending an ended parser', () => {
    const parser = start()
    append(parser, 104)
    append(parser, 101)
    append(parser, 108)
    append(parser, 108)
    append(parser, 111)
    end(parser)

    expect(() => {
      end(parser)
    }).toThrowError('Unable to end the same parser more than once.')
  })

  describe('throws an error when appending non-byte', () => {
    for (const nonByte of [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN, -1, -2, 256, 257, 1.5, -0]) {
      it(String(nonByte), () => {
        const parser = start()
        expect(() => {
          append(parser, nonByte)
        }).toThrowError('Bytes must be integers between 0 and 255.')
      })
    }
  })
})
