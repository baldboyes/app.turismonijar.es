function escapeRawControlCharsInJsonStrings(json: string) {
  let result = ''
  let inString = false
  let escaped = false

  for (const char of json) {
    if (inString && !escaped) {
      if (char === '\n') {
        result += '\\n'
        continue
      }

      if (char === '\r') {
        result += '\\r'
        continue
      }

      if (char === '\t') {
        result += '\\t'
        continue
      }
    }

    result += char

    if (escaped) {
      escaped = false
      continue
    }

    if (char === '\\') {
      escaped = true
      continue
    }

    if (char === '"') {
      inString = !inString
    }
  }

  return result
}

export function parseTolerantJson<T = unknown>(json: string): T {
  try {
    return JSON.parse(json) as T
  } catch {
    return JSON.parse(escapeRawControlCharsInJsonStrings(json)) as T
  }
}
