<script lang="ts">
  import './global.scss'
  import 'normalize.css'
  import { Router } from '@roxi/routify'
  import { routes } from '../.routify/routes'
  let base_url = import.meta.env.BASE_URL
  base_url = base_url.substring(0, base_url.length - 1)
  const config = {
    urlTransform: {
      apply: (url) => `${base_url}${url}`,
      remove: (url) => url.replace(base_url, '')
    }
  }
</script>

<Router {config} {routes} />
