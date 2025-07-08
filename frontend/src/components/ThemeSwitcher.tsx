import { useTheme } from '../hooks/useTheme'

export default function ThemeSwitcher() {
  const { toggleTheme, isDark } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors bg-gray-300 dark:bg-gray-600"
      style={{
        backgroundColor: isDark ? 'var(--text-muted)' : 'var(--border-color)'
      }}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span
        className={`inline-flex h-4 w-4 items-center justify-center transform rounded-full bg-white transition-transform ${
          isDark ? 'translate-x-6' : 'translate-x-1'
        }`}
        style={{
          backgroundColor: 'var(--bg-white)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {isDark ? (
          // Moon icon for dark mode
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          // Sun icon for light mode
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--warning-yellow)" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
      </span>
    </button>
  )
}