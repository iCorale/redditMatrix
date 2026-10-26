const originalFetch = window.fetch.bind(window)

function isListing(url) {
  return /\/r\/[^/]+\/[^/]+\.json(\?|$)/.test(url)
}

function askExtension(url) {
  return new Promise((resolve) => {
    const id = Math.random().toString(36).slice(2)
    const timer = setTimeout(() => finish(null), 40000)
    function finish(body) {
      clearTimeout(timer)
      window.removeEventListener('message', onMessage)
      resolve(body)
    }
    function onMessage(event) {
      if (event.source !== window || event.data?.type !== 'rm-res' || event.data.id !== id) return
      finish(event.data.body)
    }
    window.addEventListener('message', onMessage)
    window.postMessage({ type: 'rm-req', id, url }, '*')
  })
}

window.fetch = async function (input, init) {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  if (!isListing(url)) return originalFetch(input, init)

  try {
    const body = await askExtension(url)
    if (body?.data && Array.isArray(body.data.children)) {
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    }
  } catch (err) {
    console.error(err)
  }
  return new Response(JSON.stringify({ error: true }), {
    status: 502,
    headers: { 'content-type': 'application/json' }
  })
}
