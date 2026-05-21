import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    hint?: string
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, icon, iconPosition = 'left', className = '', ...props }, ref) => {
        const inputId = props.id || props.name || `input-${Math.random().toString(36).slice(2)}`

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-foreground mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && iconPosition === 'left' && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`
              w-full px-4 py-2.5 text-sm
              bg-card text-foreground
              border border-border rounded-xl
              placeholder:text-muted-foreground
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon && iconPosition === 'left' ? 'pl-10' : ''}
              ${icon && iconPosition === 'right' ? 'pr-10' : ''}
              ${error ? 'border-destructive focus:ring-destructive/30 focus:border-destructive' : ''}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        {...props}
                    />
                    {icon && iconPosition === 'right' && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={`${inputId}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-muted-foreground">
                        {hint}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
    hint?: string
    maxLength?: number
    showCount?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, maxLength, showCount = false, className = '', value, ...props }, ref) => {
        const textareaId = props.id || props.name || `textarea-${Math.random().toString(36).slice(2)}`
        const charCount = typeof value === 'string' ? value.length : 0

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-foreground mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <textarea
                        ref={ref}
                        id={textareaId}
                        value={value}
                        maxLength={maxLength}
                        className={`
              w-full px-4 py-3 text-sm
              bg-card text-foreground
              border border-border rounded-xl
              placeholder:text-muted-foreground
              transition-all duration-200 resize-none
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-destructive focus:ring-destructive/30 focus:border-destructive' : ''}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
                        {...props}
                    />
                    {showCount && maxLength && (
                        <div className="absolute right-3 bottom-2 text-xs text-muted-foreground">
                            {charCount}/{maxLength}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p id={`${textareaId}-hint`} className="mt-1.5 text-xs text-muted-foreground">
                        {hint}
                    </p>
                )}
            </div>
        )
    }
)

Textarea.displayName = 'Textarea'
