import octokit from './octokit.ts'

export async function handleRequest(
  req: Request,
  url: URL
): Promise<false | Response> {
  if (url.pathname === '/release/latest') {
    const release = await getLatestRelease()
    return new Response(JSON.stringify(release), {
      headers: {
        'content-type': 'application/json'
      }
    })
  } else if (url.pathname === '/release/download') {
    const id = url.searchParams.get('id')
    if (!id || !/^\d+$/.test(id)) {
      return new Response('Illegal release id', { status: 400 })
    }

    const releaseId = Number(id)
    let release = releaseId === lastestRelease?.id && lastestRelease
    if (!release) try {
      release = await getReleaseById(releaseId)
    } catch (e) {
      return new Response(e.message, { status: 400 })
    }

    return await fetch(release.asset.download_url, {
      signal: req.signal,
      referrerPolicy: 'no-referrer'
    })
  }

  return false
}

// Only get 2023-05-01T00:00:00Z after
const cratedAtStart = new Date('2023-05-01T00:00:00Z')

// 5 minutes cache
const releaseCacheTTL = 5 * 60 * 1000 // 5 minutes
let lastReleaseCheck = 0
let lastestRelease: {
  id: number
  tag_name: string
  prerelease: boolean
  created_at: string
  asset: {
    name: string
    size: number
    download_url: string
  }
}

async function getLatestRelease(): Promise<typeof lastestRelease> {
  const now = Date.now()
  if (now - lastReleaseCheck < releaseCacheTTL && lastestRelease) {
    console.debug(`Using cached latest release: ${lastestRelease.tag_name}`)
    return lastestRelease
  }

  console.debug('Fetching latest release...')
  const { data: releases } = await octokit.rest.repos.listReleases({
    owner: 'lgou2w',
    repo: 'HoYo.Gacha',
  })

  const release = releases.filter((release) => {
    const createdAt = new Date(release.created_at)
    return createdAt >= cratedAtStart &&
      release.assets.find((asset) => asset.name.endsWith('.exe'))
  })[0]

  if (!release) {
    throw new Error('No release found.')
  }

  const asset = release.assets.find((asset) => asset.name.endsWith('.exe'))!
  lastestRelease = {
    id: release.id,
    tag_name: release.tag_name,
    prerelease: release.prerelease,
    created_at: release.created_at,
    asset: {
      name: asset.name,
      size: asset.size,
      download_url: asset.browser_download_url,
    }
  }

  console.debug('Latest release:', lastestRelease)
  lastReleaseCheck = now
  return lastestRelease
}

async function getReleaseById(id: number): Promise<typeof lastestRelease> {
  const { data: release } = await octokit.rest.repos.getRelease({
    owner: 'lgou2w',
    repo: 'HoYo.Gacha',
    release_id: id
  })

  const asset = release.assets.find((asset) => asset.name.endsWith('.exe'))!
  return {
    id: release.id,
    tag_name: release.tag_name,
    prerelease: release.prerelease,
    created_at: release.created_at,
    asset: {
      name: asset.name,
      size: asset.size,
      download_url: asset.browser_download_url,
    }
  }
}
