// Minimal LZ-based string compression from lz-string (MIT)
// Only the methods needed for Uint8Array <-> string conversions are retained.

const f = String.fromCharCode

function compress(uncompressed: string): string {
  if (uncompressed == null) return ''

  const contextDictionary: Record<string, number> = {}
  const contextDictionaryToCreate: Record<string, boolean> = {}
  let contextC = ''
  let contextW = ''
  const contextData: number[] = []
  let contextEnlargeIn = 2
  let contextDictSize = 3
  let contextNumBits = 2
  let i = 0

  const pushBits = (value: number, bits: number) => {
    for (let j = 0; j < bits; j++) {
      contextData.push((value >> j) & 1)
    }
  }

  const writeBits = (value: number) => {
    for (let j = 0; j < contextNumBits; j++) {
      contextData.push((value >> j) & 1)
    }
  }

  while (i < uncompressed.length) {
    contextC = uncompressed.charAt(i)
    if (!Object.prototype.hasOwnProperty.call(contextDictionary, contextC)) {
      contextDictionary[contextC] = contextDictSize++
      contextDictionaryToCreate[contextC] = true
    }

    const contextWC = contextW + contextC
    if (Object.prototype.hasOwnProperty.call(contextDictionary, contextWC)) {
      contextW = contextWC
    } else {
      if (Object.prototype.hasOwnProperty.call(contextDictionaryToCreate, contextW)) {
        const value = contextW.charCodeAt(0)
        if (value < 256) {
          writeBits(0)
          pushBits(value, 8)
        } else {
          writeBits(1)
          pushBits(value, 16)
        }
        contextEnlargeIn--
        if (contextEnlargeIn === 0) {
          contextEnlargeIn = Math.pow(2, contextNumBits)
          contextNumBits++
        }
        delete contextDictionaryToCreate[contextW]
      } else {
        writeBits(contextDictionary[contextW])
      }
      contextEnlargeIn--
      if (contextEnlargeIn === 0) {
        contextEnlargeIn = Math.pow(2, contextNumBits)
        contextNumBits++
      }
      contextDictionary[contextWC] = contextDictSize++
      contextW = String(contextC)
    }
    i++
  }

  if (contextW !== '') {
    if (Object.prototype.hasOwnProperty.call(contextDictionaryToCreate, contextW)) {
      const value = contextW.charCodeAt(0)
      if (value < 256) {
        writeBits(0)
        pushBits(value, 8)
      } else {
        writeBits(1)
        pushBits(value, 16)
      }
      contextEnlargeIn--
      if (contextEnlargeIn === 0) {
        contextEnlargeIn = Math.pow(2, contextNumBits)
        contextNumBits++
      }
      delete contextDictionaryToCreate[contextW]
    } else {
      writeBits(contextDictionary[contextW])
    }
    contextEnlargeIn--
    if (contextEnlargeIn === 0) {
      contextEnlargeIn = Math.pow(2, contextNumBits)
      contextNumBits++
    }
  }

  const value = 2
  for (let j = 0; j < contextNumBits; j++) {
    contextData.push((value >> j) & 1)
  }

  while (contextData.length % 8 !== 0) {
    contextData.push(0)
  }

  return contextData.reduce((acc, bit, idx) => {
    if (idx % 8 === 0) acc += f(bit)
    else acc = acc.slice(0, -1) + f(acc.charCodeAt(acc.length - 1) | (bit << (idx % 8)))
    return acc
  }, '')
}

function decompress(compressed: string): string {
  if (compressed == null) return ''
  if (compressed === '') return null as any

  const getBits = (index: number) => compressed.charCodeAt(index) & 0xff
  const length = compressed.length
  let resetValue = 1
  let maxpower = Math.pow(2, 2)
  let power = 1
  let c = getBits(0)
  let dataIndex = 1
  let bitsPerChar = 8
  let enlargeIn = 4
  let dictSize = 4
  let numBits = 3
  const dictionary: Record<number, string> = { 0: '0', 1: '1', 2: '2' }
  let entry = ''
  let result: string[] = []

  let bits = 0
  power = 1
  while (power !== maxpower) {
    bits |= (c & resetValue) > 0 ? power : 0
    resetValue <<= 1
    power <<= 1
    if (resetValue === 256) {
      resetValue = 1
      c = getBits(dataIndex++)
    }
  }

  const firstChar = bits
  switch (firstChar) {
    case 0:
      bits = 0
      maxpower = Math.pow(2, 8)
      power = 1
      resetValue = 1
      while (power !== maxpower) {
        bits |= (c & resetValue) > 0 ? power : 0
        resetValue <<= 1
        power <<= 1
        if (resetValue === 256) {
          resetValue = 1
          c = getBits(dataIndex++)
        }
      }
      dictionary[3] = f(bits)
      break
    case 1:
      bits = 0
      maxpower = Math.pow(2, 16)
      power = 1
      resetValue = 1
      while (power !== maxpower) {
        bits |= (c & resetValue) > 0 ? power : 0
        resetValue <<= 1
        power <<= 1
        if (resetValue === 256) {
          resetValue = 1
          c = getBits(dataIndex++)
        }
      }
      dictionary[3] = f(bits)
      break
    default:
      return ''
  }

  let w = dictionary[3]
  result.push(w)
  let cc

  while (true) {
    if (dataIndex > length) return ''

    bits = 0
    maxpower = Math.pow(2, numBits)
    power = 1
    resetValue = 1
    while (power !== maxpower) {
      bits |= (c & resetValue) > 0 ? power : 0
      resetValue <<= 1
      power <<= 1
      if (resetValue === 256) {
        resetValue = 1
        c = getBits(dataIndex++)
      }
    }

    switch ((cc = bits)) {
      case 0:
        bits = 0
        maxpower = Math.pow(2, 8)
        power = 1
        resetValue = 1
        while (power !== maxpower) {
          bits |= (c & resetValue) > 0 ? power : 0
          resetValue <<= 1
          power <<= 1
          if (resetValue === 256) {
            resetValue = 1
            c = getBits(dataIndex++)
          }
        }
        dictionary[dictSize++] = f(bits)
        cc = dictSize - 1
        enlargeIn--
        break
      case 1:
        bits = 0
        maxpower = Math.pow(2, 16)
        power = 1
        resetValue = 1
        while (power !== maxpower) {
          bits |= (c & resetValue) > 0 ? power : 0
          resetValue <<= 1
          power <<= 1
          if (resetValue === 256) {
            resetValue = 1
            c = getBits(dataIndex++)
          }
        }
        dictionary[dictSize++] = f(bits)
        cc = dictSize - 1
        enlargeIn--
        break
      case 2:
        return result.join('')
    }

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits)
      numBits++
    }

    let entryStr
    if (dictionary[cc]) {
      entryStr = dictionary[cc]
    } else {
      if (cc === dictSize) {
        entryStr = w + w.charAt(0)
      } else {
        return ''
      }
    }
    result.push(entryStr)

    dictionary[dictSize++] = w + entryStr.charAt(0)
    enlargeIn--
    w = entryStr

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits)
      numBits++
    }
  }
}

function compressToUint8Array(input: string): Uint8Array {
  const compressed = compress(input)
  const buf = new Uint8Array(compressed.length)
  for (let i = 0; i < compressed.length; i++) {
    buf[i] = compressed.charCodeAt(i)
  }
  return buf
}

function decompressFromUint8Array(compressed: Uint8Array): string {
  let result = ''
  for (let i = 0; i < compressed.length; i++) {
    result += f(compressed[i])
  }
  return decompress(result)
}

export { compressToUint8Array, decompressFromUint8Array }
