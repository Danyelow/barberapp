import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

type StoredProfile = {
  photo?: string
  preferredService?: string
}

type ProfileMap = Record<string, StoredProfile>

const STORAGE_KEY = 'barberapp.profile.v1'

function readProfiles(): ProfileMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).flatMap(([userId, value]) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) return []
        const candidate = value as Record<string, unknown>
        const stored: StoredProfile = {}
        if (typeof candidate.photo === 'string' && candidate.photo) stored.photo = candidate.photo
        if (typeof candidate.preferredService === 'string' && candidate.preferredService) {
          stored.preferredService = candidate.preferredService
        }
        return [[userId, stored]]
      }),
    )
  } catch {
    return {}
  }
}

function writeProfiles(profiles: ProfileMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
    return true
  } catch {
    return false
  }
}

type ProfilePreferencesContextValue = {
  photo: string | null
  preferredService: string | null
  setPhoto: (value: string | null) => boolean
  setPreferredService: (value: string | null) => boolean
}

const ProfilePreferencesContext = createContext<ProfilePreferencesContextValue | null>(null)

export function ProfilePreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<ProfileMap>(readProfiles)

  const current = user ? profiles[user.id] : undefined

  const updateProfile = useCallback(
    (patch: Partial<StoredProfile>) => {
      if (!user) return false
      const next: ProfileMap = {
        ...profiles,
        [user.id]: {
          ...profiles[user.id],
          ...patch,
        },
      }
      if (!writeProfiles(next)) return false
      setProfiles(next)
      return true
    },
    [profiles, user],
  )

  const setPhoto = useCallback(
    (value: string | null) => updateProfile({ photo: value || undefined }),
    [updateProfile],
  )

  const setPreferredService = useCallback(
    (value: string | null) => updateProfile({ preferredService: value || undefined }),
    [updateProfile],
  )

  const value = useMemo(
    () => ({
      photo: current?.photo ?? null,
      preferredService: current?.preferredService ?? null,
      setPhoto,
      setPreferredService,
    }),
    [current?.photo, current?.preferredService, setPhoto, setPreferredService],
  )

  return (
    <ProfilePreferencesContext.Provider value={value}>{children}</ProfilePreferencesContext.Provider>
  )
}

export const useProfilePreferences = () => {
  const context = useContext(ProfilePreferencesContext)
  if (!context) {
    throw new Error('useProfilePreferences debe usarse dentro de ProfilePreferencesProvider')
  }
  return context
}
