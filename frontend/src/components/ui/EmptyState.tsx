export interface EmptyStateProps {
    icon?: React.ReactNode
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className = ''
}: EmptyStateProps) {
    return (
        <div
            className={`
        flex flex-col items-center justify-center
        text-center py-12 px-6
        ${className}
      `.trim().replace(/\s+/g, ' ')}
        >
            {icon && (
                <div className="w-16 h-16 mb-4 text-muted-foreground opacity-50">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                    {description}
                </p>
            )}
            {action && (
                <button
                    onClick={action.onClick}
                    className="
            px-4 py-2 text-sm font-medium
            bg-primary text-white
            rounded-xl hover:bg-primary/90
            transition-colors
          "
                >
                    {action.label}
                </button>
            )}
        </div>
    )
}
