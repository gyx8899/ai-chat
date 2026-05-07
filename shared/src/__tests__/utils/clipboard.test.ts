import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { copyToClipboard } from '../../utils/clipboard'

describe('copyToClipboard', () => {
  const originalClipboard = navigator.clipboard

  beforeEach(() => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
    })
    vi.restoreAllMocks()
  })

  test('复制成功时返回 true', async () => {
    const result = await copyToClipboard('test text')
    expect(result).toBe(true)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text')
  })

  test('复制失败时返回 false', async () => {
    const mockError = new Error('Clipboard API not available')
    ;(navigator.clipboard.writeText as vi.Mock).mockRejectedValue(mockError)

    const result = await copyToClipboard('test text')
    expect(result).toBe(false)
  })

  test('复制空字符串成功', async () => {
    const result = await copyToClipboard('')
    expect(result).toBe(true)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('')
  })

  test('复制特殊字符成功', async () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const result = await copyToClipboard(specialChars)
    expect(result).toBe(true)
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(specialChars)
  })
})