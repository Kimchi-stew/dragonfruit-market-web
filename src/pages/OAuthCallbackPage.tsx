import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../api/auth'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const accessToken  = params.get('accessToken')
    const refreshToken = params.get('refreshToken')
    const isNewUser    = params.get('isNewUser') === 'true'

    if (!accessToken || !refreshToken) {
      navigate('/login', { replace: true })
      return
    }

    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)

    if (isNewUser) {
      navigate('/social-signup', { replace: true })
      return
    }

    userApi.getProfile()
      .then((res) => {
        localStorage.setItem('user', JSON.stringify(res.data))
        navigate('/', { replace: true })
      })
      .catch(() => navigate('/', { replace: true }))
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}
