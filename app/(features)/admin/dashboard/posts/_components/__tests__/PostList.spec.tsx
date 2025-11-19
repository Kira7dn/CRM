import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('../actions', () => ({
  deletePostAction: vi.fn().mockResolvedValue(undefined),
}))

describe('PostList', () => {
  it('renders posts correctly', async () => {
    process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test'
    process.env.MONGODB_DB = process.env.MONGODB_DB || 'testdb'
    const { default: PostList } = await import('../PostList')
    render(<PostList initialPosts={[{ id: '1', title: 'Hello', body: 'World' }]} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
