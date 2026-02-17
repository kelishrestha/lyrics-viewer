export function hasSpecialCharacters(str: string) {
  return !!str.match(/[^\x20-\x7E\t\n\r]/g);
}
export function removeAccents(str: string) {
  return str
    .normalize('NFD') // Decompose accented characters into base letter + accent mark
    .replace(/[\u0300-\u036f]/g, '')
    .trim(); // Remove the accent marks (Unicode range)
};

export function removeTrailingBrackets(input: string) {
  return input.replace(/\(\(\)\)/g, '')
              .replace(/\(\)\(\)/g, '')
              .replace(/\(\)/g, '')
              .trim();
}

export function removeSpecialCharacters(input: string) {
  return input.replace(/[^\x20-\x7E\t\n\r]/g, "").trim();
}

export function removeNormalCharacters(input: string){
  return input.replace(/[a-zA-Z0-9\s]/g, " ").trim();
}

export function normalizeText(text: string) {
  return text
    .normalize("NFKC")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
}

export function normalizeWithoutNormalChars(str: string){
  if(hasSpecialCharacters(str)){
    return removeTrailingBrackets(removeNormalCharacters(str))
  }
}

export function normalizeWithoutSpecialChars(str: string){
  return removeTrailingBrackets(removeSpecialCharacters(removeAccents(str)))
}

export function buildQuery(artist: string, title: string){
  if(hasSpecialCharacters(title) && hasSpecialCharacters(artist)){
    return `${normalizeWithoutNormalChars(title)} ${normalizeWithoutNormalChars(artist)}`.trim();
  } else if(hasSpecialCharacters(title) && !hasSpecialCharacters(artist)){
    return `${normalizeWithoutNormalChars(title)} ${normalizeWithoutSpecialChars(artist)}`.trim();
  } else if(hasSpecialCharacters(artist) && !hasSpecialCharacters(title)){
    return `${normalizeWithoutSpecialChars(title)} ${normalizeWithoutNormalChars(artist)}`.trim();
  } else {
    return `${normalizeWithoutSpecialChars(title)} ${normalizeWithoutSpecialChars(artist)}`.trim();
  }
}

// Check if title is a substring in response title
export const titleSubStringCheck = (sourceText: string, targetText: string) => {
  return sourceText.replace('(','').replace(')', '').split(' ').every(item => targetText.split(' ').includes(item))
}

export function withTimeout(ms: number) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  return { signal: ctrl.signal, cancel: () => clearTimeout(t) }
}

export async function fetchJSON<T>(url: string, source: string, headers?: null | Record<string, string>, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const { signal, cancel } = withTimeout(timeoutMs)
  try {
    const res = await fetch(url, {
      ...init,
      signal,
      ...headers && { headers },
    })
    if (!res.ok) throw new Error(`${source} ${res.status} ${res.statusText}`)
    return (await res.json()) as T
  } finally {
    cancel()
  }
}
