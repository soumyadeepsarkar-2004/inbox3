$files = Get-ChildItem -Path "c:\inbox3\frontend\src\components" -Recurse -Filter "*.tsx"
foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    $newContent = $content `
        -replace 'bg-white dark:bg-card', 'bg-card/50 liquid-glass' `
        -replace 'bg-gray-100 dark:bg-secondary', 'bg-secondary' `
        -replace 'bg-gray-50 dark:bg-secondary', 'bg-secondary' `
        -replace 'text-gray-900 dark:text-foreground', 'text-foreground' `
        -replace 'text-gray-800 dark:text-white', 'text-foreground' `
        -replace 'text-gray-600 dark:text-muted-foreground', 'text-muted-foreground' `
        -replace 'text-gray-500 dark:text-muted-foreground', 'text-muted-foreground' `
        -replace 'border-gray-200 dark:border-border', 'border-border/40' `
        -replace 'border-gray-100 dark:border-border/50', 'border-white/5' `
        -replace 'text-indigo-600 dark:text-primary', 'text-primary' `
        -replace 'hover:bg-indigo-500 dark:hover:bg-primary', 'hover:bg-primary/90' `
        -replace 'bg-indigo-50 dark:bg-primary/10', 'bg-primary/10' `
        -replace 'hover:bg-gray-100 dark:hover:bg-secondary', 'hover:bg-white/5' `
        -replace 'hover:bg-gray-50 dark:hover:bg-secondary', 'hover:bg-white/5' `
        -replace 'hover:bg-gray-100 dark:hover:border-border', 'hover:border-white/10' `
        -replace 'dark:hover:bg-white/5', 'hover:bg-white/5' `
        -replace 'dark:text-white', 'text-foreground'

    if ($newContent -cne $content) {
        Write-Host "Updating $($f.Name)"
        [IO.File]::WriteAllText($f.FullName, $newContent)
    }
}
