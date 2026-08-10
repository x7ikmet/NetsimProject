import { useEffect, useState } from 'react'
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  UserRound,
} from 'lucide-react'
import { getCurrentUser, login, logout } from '../api/authApi'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './ui/input-group'
import './AuthGate.css'

export function AuthGate({ children }) {
  const [user, setUser] = useState(undefined)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const passwordVisibilityLabel = isPasswordVisible
    ? 'Şifreyi gizle'
    : 'Şifreyi göster'

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))

    function handleSessionExpired() {
      setUser(null)
      setPassword('')
      setError('Oturum süreniz doldu. Lütfen tekrar giriş yapın.')
    }
    window.addEventListener('netsim:session-expired', handleSessionExpired)

    return () => {
      window.removeEventListener(
        'netsim:session-expired',
        handleSessionExpired,
      )
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(username.trim(), password)
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        throw new Error('Session was not created.')
      }

      setPassword('')
      setUser(currentUser)
    } catch {
      setError('Kullanıcı adı veya şifre geçersiz.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLogout() {
    setError('')
    setSubmitting(true)

    try {
      await logout()
      setUsername('')
      setPassword('')
      setUser(null)
    } catch {
      setError('Oturum kapatılamadı. Lütfen tekrar deneyin.')
    } finally {
      setSubmitting(false)
    }
  }

  if (user === undefined) {
    return (
      <main className="auth-loading" aria-busy="true">
        <LoaderCircle className="auth-spinner" aria-hidden="true" />
        <p role="status">Oturum kontrol ediliyor</p>
      </main>
    )
  }

  if (user === null) {
    return (
      <main className="auth-page">
        <section className="auth-visual" aria-labelledby="auth-title">

          <div className="auth-intro">
            <h1 id="auth-title">
              Ürün ağacınız,
              <br />
              tek bir akışta.
            </h1>
            <p>
              Stok, varyant ve maliyet çalışmalarınıza güvenli şekilde devam
              edin.
            </p>
          </div>
        </section>

        <section className="auth-panel" aria-label="Giriş formu">
          <form className="auth-form" onSubmit={handleSubmit}>
            <header>
              <h2>Hoş geldiniz</h2>
              <p>Devam etmek için hesabınızla giriş yapın.</p>
            </header>

            <div className="auth-field">
              <label htmlFor="username">Kullanıcı adı</label>
              <div className="auth-input-wrap">
                <UserRound aria-hidden="true" />
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="password">Şifre</label>
              <div className="auth-input-wrap">
                <LockKeyhole aria-hidden="true" />
                <InputGroup className="auth-password-input">
                  <InputGroupInput
                    id="password"
                    name="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={submitting}
                    required
                  />
                  <InputGroupAddon>
                    <InputGroupButton
                      size="icon-sm"
                      onClick={() => setIsPasswordVisible((visible) => !visible)}
                      disabled={submitting}
                      aria-label={passwordVisibilityLabel}
                      title={passwordVisibilityLabel}
                    >
                      {isPasswordVisible ? (
                        <EyeOff data-icon="inline-start" />
                      ) : (
                        <Eye data-icon="inline-start" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>

            <div className="auth-message" aria-live="polite">
              {error ? <p role="alert">{error}</p> : null}
            </div>

            <Button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? (
                <LoaderCircle className="auth-spinner" aria-hidden="true" />
              ) : null}
              {submitting ? 'Giriş yapılıyor...' : 'Giriş yap'}
            </Button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <div className="authenticated-app">
      <div className="session-bar">
        <div className="session-identity">
          <span aria-hidden="true">
            <UserRound />
          </span>
          <div>
            <strong>{user.username}</strong>
          </div>
        </div>
        {error ? <p role="alert">{error}</p> : null}
        <Button
          type="button"
          variant="outline"
          onClick={handleLogout}
          disabled={submitting}
        >
          {submitting ? (
            <LoaderCircle className="auth-spinner" aria-hidden="true" />
          ) : (
            <LogOut aria-hidden="true" />
          )}
          Çıkış yap
        </Button>
      </div>
      {children}
    </div>
  )
}
