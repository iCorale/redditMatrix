const NAME = /^[A-Za-z0-9_]{2,21}$/

/**
 * The subreddit named by what the user typed: a bare name, `r/name`, `/r/name`,
 * or any Reddit link that contains `/r/name`. Empty when it names none.
 */
export function subredditFrom(input: string): string {
  const text = input.trim()
  if (!text) return ''
  const inLink = /(?:^|[/.])reddit\.com\/r\/([A-Za-z0-9_]+)/i.exec(text)
  if (inLink) return NAME.test(inLink[1]) ? inLink[1] : ''
  const bare = text.replace(/^\/?r\//i, '').replace(/\/+$/, '')
  return NAME.test(bare) ? bare : ''
}

/** A stable hue for a name, so a subreddit without a cover keeps its colour. */
export function hueFor(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return Math.abs(hash) % 360
}
