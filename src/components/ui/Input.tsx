import { type InputHTMLAttributes, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

export default function Input({ label, helperText, error, className = '', type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
          className={`w-full h-12 px-4 text-sm bg-transparent border-2 rounded-xl outline-none transition-all duration-200 focus:border-[#FF3D87] focus:ring-4 focus:ring-[#FF3D87]/10 ${className}`}
          style={{
            borderColor: error ? 'var(--color-error)' : 'var(--color-border)',
            color: 'var(--color-text-primary)'
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword
              ? <EyeOff size={18} style={{ color: 'var(--color-text-secondary)' }} />
              : <Eye size={18} style={{ color: 'var(--color-text-secondary)' }} />
            }
          </button>
        )}
      </div>
      {(error || helperText) && (
        <p
          className="text-xs"
          style={{ color: error ? 'var(--color-error)' : 'var(--color-text-secondary)' }}
        >
          {error || helperText}
        </p>
      )}
    </div>
  )
}
