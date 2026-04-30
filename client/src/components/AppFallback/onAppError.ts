import type React from 'react'
import { logger } from '@shared/utils'

const log = logger.withPrefix('[App]')

export function onAppError(error: Error, info: React.ErrorInfo): void {
  log.error('App crashed', error, info.componentStack)
}
