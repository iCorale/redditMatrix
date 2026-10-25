window.addEventListener('message', (event) => {
  if (event.source !== window || event.data?.type !== 'rm-req') return
  chrome.runtime.sendMessage({ type: 'rm-req', url: event.data.url }, (response) => {
    window.postMessage(
      { type: 'rm-res', id: event.data.id, body: response?.body ?? null },
      '*'
    )
  })
})
