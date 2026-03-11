<template>
  <div v-if="open" class="hotspot-modal" role="dialog" aria-modal="true">
    <button type="button" class="hotspot-modal__backdrop" @click="$emit('close')"></button>
    <div class="hotspot-modal__panel">
      <button type="button" class="hotspot-modal__close" @click="$emit('close')">Close</button>

      <section v-if="type === 'audio'">
        <h2>Audio note</h2>
        <audio v-if="normalizedAudioUrl" controls autoplay preload="metadata" class="hotspot-audio">
          <source :src="normalizedAudioUrl" :type="audioMimeType" />
          Your browser does not support audio playback.
        </audio>
        <p v-if="normalizedAudioUrl" class="hotspot-audio-link">
          <a :href="normalizedAudioUrl" target="_blank" rel="noreferrer">Open audio in a new tab</a>
        </p>
        <p v-else>No audio URL provided for this hotspot.</p>
      </section>

      <section v-else-if="type === 'video'">
        <h2>Video</h2>

        <div v-if="embedUrl" class="hotspot-video-frame">
          <iframe
            :src="embedUrl"
            title="Hotspot video"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>

        <video v-else-if="isMp4" controls autoplay class="hotspot-video-player">
          <source :src="videoUrl" type="video/mp4" />
        </video>

        <p v-else-if="videoUrl">
          <a :href="videoUrl" target="_blank" rel="noreferrer">Open video link</a>
        </p>

        <p v-else>No video URL provided for this hotspot.</p>
      </section>

      <section v-else>
        <h2>Note</h2>
        <p>{{ text || 'No text provided for this hotspot.' }}</p>
      </section>
    </div>
  </div>
</template>

<script>
function extractGoogleDriveFileId(url) {
  const value = String(url || '').trim()
  if (!value) return ''

  const directMatch = value.match(/[?&]id=([\w-]+)/)
  if (directMatch?.[1]) return directMatch[1]

  const patterns = [
    /drive\.google\.com\/file\/d\/([\w-]+)/,
    /drive\.google\.com\/open\?id=([\w-]+)/,
    /drive\.google\.com\/uc\?.*id=([\w-]+)/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }

  return ''
}

function normalizeAudioUrl(url) {
  const value = String(url || '').trim()
  if (!value) return ''

  if (/drive\.google\.com/i.test(value)) {
    const fileId = extractGoogleDriveFileId(value)
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`
    }
  }

  if (/dropbox\.com/i.test(value)) {
    if (/[?&]raw=1\b/i.test(value)) return value
    if (/[?&]dl=0\b/i.test(value)) return value.replace(/[?&]dl=0\b/i, (match) => match.replace('0', '1'))
    return `${value}${value.includes('?') ? '&' : '?'}raw=1`
  }

  return value
}

function detectAudioMimeType(url) {
  const value = String(url || '').trim().toLowerCase()
  if (!value) return 'audio/mpeg'
  if (/\.m4a(?:$|\?)/.test(value)) return 'audio/mp4'
  if (/\.mp3(?:$|\?)/.test(value)) return 'audio/mpeg'
  if (/\.wav(?:$|\?)/.test(value)) return 'audio/wav'
  if (/\.ogg(?:$|\?)/.test(value)) return 'audio/ogg'
  if (/\.aac(?:$|\?)/.test(value)) return 'audio/aac'
  if (/\.flac(?:$|\?)/.test(value)) return 'audio/flac'
  if (/\.webm(?:$|\?)/.test(value)) return 'audio/webm'
  return 'audio/mpeg'
}

function extractYouTubeId(url) {
  const value = String(url || '').trim()
  if (!value) return ''
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }
  return ''
}

function extractVimeoId(url) {
  const value = String(url || '').trim()
  if (!value) return ''
  const patterns = [/vimeo\.com\/(?:video\/)?(\d+)/, /player\.vimeo\.com\/video\/(\d+)/]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }
  return ''
}

export default {
  name: 'HotspotModal',
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    audioUrl: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
  },
  computed: {
    normalizedAudioUrl() {
      return normalizeAudioUrl(this.audioUrl)
    },
    audioMimeType() {
      return detectAudioMimeType(this.normalizedAudioUrl)
    },
    isMp4() {
      return /\.mp4(?:$|\?)/i.test(this.videoUrl || '')
    },
    embedUrl() {
      const ytId = extractYouTubeId(this.videoUrl)
      if (ytId) return `https://www.youtube.com/embed/${ytId}`

      const vimeoId = extractVimeoId(this.videoUrl)
      if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`

      return ''
    },
  },
}
</script>

<style scoped>
.hotspot-modal {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.hotspot-modal__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(23, 10, 18, 0.62);
}

.hotspot-modal__panel {
  position: relative;
  width: min(720px, 96vw);
  border-radius: 14px;
  background: #fff;
  padding: 18px;
  box-shadow: 0 18px 34px rgba(20, 10, 18, 0.3);
  z-index: 1;
}

.hotspot-modal__close {
  border: 1px solid rgba(160, 44, 95, 0.35);
  border-radius: 999px;
  background: #fff;
  color: #8b3f63;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 6px 11px;
  cursor: pointer;
}

.hotspot-audio,
.hotspot-video-player {
  width: 100%;
}

.hotspot-audio-link {
  margin-top: 10px;
}

.hotspot-video-frame {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #000;
}

.hotspot-video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
</style>
