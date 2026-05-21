$files = Get-ChildItem -Path "c:\inbox3\frontend\src" -Recurse -Filter "*.tsx"
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $newContent = $content `
        -replace '\(--bg-main\)', 'background' `
        -replace '\(--bg-card\)', 'card' `
        -replace '\(--bg-secondary\)', 'secondary' `
        -replace '\(--bg-tertiary\)', 'muted' `
        -replace '\(--bg-hover\)', 'accent' `
        -replace '\(--bg-active\)', 'accent/80' `
        -replace '\(--text-primary\)', 'foreground' `
        -replace '\(--text-secondary\)', 'muted-foreground' `
        -replace '\(--text-muted\)', 'muted-foreground' `
        -replace '\(--text-disabled\)', 'muted-foreground/50' `
        -replace '\(--border-color\)', 'border' `
        -replace '\(--border-focus\)', 'ring' `
        -replace '\(--primary-brand-hover\)', 'primary/90' `
        -replace '\(--primary-brand-light\)', 'primary/10' `
        -replace '\(--primary-brand-dark\)', 'primary/90' `
        -replace '\(--primary-brand\)', 'primary' `
        -replace '\(--error-red\)', 'destructive' `
        -replace '\(--success-green\)', 'green-500' `
        -replace '\(--info-blue\)', 'blue-500'
    
    if ($newContent -cne $content) {
        Write-Host "Updating $($f.Name)"
        [IO.File]::WriteAllText($f.FullName, $newContent)
    }
}
