import { Http } from '@capacitor-community/http'

export const getPosts = async (
  subreddit: string,
  query: string,
  after: string
) => {
  // set params
  let params: any = {
    restrict_sr: '1',
    nsfw: '1',
    include_over_18: 'on'
  }
  if (query) {
    params.q = query
  }
  if (after) {
    params.after = after
  }

  let url: string = ''
  if (query) {
    url = `https://www.reddit.com/r/${subreddit}/search.json`
  } else {
    url = `https://www.reddit.com/r/${subreddit}.json`
  }
  const options = { url, params }

  // get posts from reddit api
  const res = await Http.get(options)
  if (res.status !== 200) {
    return false
  }

  let posts = res.data.data.children
  return posts
    .filter((item) => {
      item = item.data
      return (
        !item.is_self &&
        !item.url.startsWith('https://www.reddit.com/gallery') &&
        !item.url.startsWith(
          `https://www.reddit.com/r/${subreddit}/comments`
        ) &&
        !item.url.startsWith(`https://macdesktops.com/index.phtml`) &&
        !item.url.startsWith(`https://gfycat.com`) &&
        !item.url.startsWith(`https://v.redd.it`) &&
        !item.url.startsWith(`https://youtu.be`) &&
        !item.url.endsWith(`.gifv`)
      )
    })
    .map((post: any) => {
      post = post.data
      return {
        id: post.name,
        title: post.title,
        url: post.url
      }
    })
}
