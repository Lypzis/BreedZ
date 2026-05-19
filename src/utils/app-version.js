function readEnvValue(name, fallback = '') {
  const values = {
    APP_VERSION: process.env.APP_VERSION ?? import.meta.env?.APP_VERSION,
    APP_BUILD_NUMBER: process.env.APP_BUILD_NUMBER ?? import.meta.env?.APP_BUILD_NUMBER,
    APP_COMMIT_SHA: process.env.APP_COMMIT_SHA ?? import.meta.env?.APP_COMMIT_SHA,
    APP_BUILD_DATE: process.env.APP_BUILD_DATE ?? import.meta.env?.APP_BUILD_DATE,
  }
  const value = values[name]

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
