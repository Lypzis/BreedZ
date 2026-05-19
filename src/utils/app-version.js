function readEnvValue(name, fallback = '') {
  const value = process.env?.[name] ?? import.meta.env?.[name]

  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed || fallback
}

export const appVersion = readEnvValue('APP_VERSION', '0.0.0')
export const appBuildNumber = readEnvValue('APP_BUILD_NUMBER')
export const appCommitSha = readEnvValue('APP_COMMIT_SHA')
export const appBuildDate = readEnvValue('APP_BUILD_DATE')

export function buildAppVersionLabel() {
  return `v${appVersion}`
}

export function buildAppBuildLabel() {
  const parts = []

  if (appBuildNumber) {
    parts.push(`#${appBuildNumber}`)
  }

  if (appCommitSha) {
    parts.push(appCommitSha)
  }

  return parts.join(' · ')
}
