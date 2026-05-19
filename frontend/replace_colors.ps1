$files = Get-ChildItem -Path "c:\inbox3\frontend\src\components" -Recurse -Filter "*.tsx"
foreach ($f in $files) {
    if ($f.Name -match 'PerformanceDashboard') { continue }
    $content = Get-Content $f.FullName -Raw
    $newContent = $content `
        -replace 'bg-white dark:bg-gray-900', 'bg-card' `
        -replace 'border-gray-100 dark:border-gray-800', 'border-border' `
        -replace 'bg-gray-50 dark:bg-gray-800', 'bg-secondary' `
        -replace 'border-gray-200 dark:border-gray-700', 'border-border' `
        -replace 'text-gray-500 dark:text-gray-400', 'text-muted-foreground' `
        -replace 'text-gray-700 dark:text-gray-300', 'text-foreground' `
        -replace 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200', 'text-muted-foreground hover:text-foreground' `
        -replace 'bg-gray-100 dark:bg-gray-800', 'bg-muted' `
        -replace 'text-gray-900', 'text-foreground' `
        -replace 'placeholder-gray-400 dark:placeholder-gray-500', 'placeholder:text-muted-foreground' `
        -replace 'bg-gray-200 dark:bg-gray-700', 'bg-muted text-foreground' `
        -replace 'text-gray-600 dark:text-gray-300', 'text-foreground' `
        -replace 'hover:bg-gray-300 dark:hover:bg-gray-600', 'hover:bg-muted-foreground/20' `
        -replace 'hover:bg-gray-200 dark:hover:bg-gray-700', 'hover:bg-muted-foreground/20' `
        -replace 'text-gray-400 dark:text-gray-500', 'text-muted-foreground' `
        -replace 'bg-white dark:focus:bg-card', 'focus:bg-card' `
        -replace 'bg-white/50 dark:bg-black/20', 'bg-black/20' `
        -replace 'from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10', 'from-white/5 to-white/10' `
        -replace 'border-white dark:border-card', 'border-card' `
        -replace 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500', 'bg-primary/10 text-primary' `
        -replace 'hover:bg-indigo-500', 'hover:bg-primary' `
        -replace 'bg-red-50 dark:bg-red-500/10', 'bg-destructive/10' `
        -replace 'hover:bg-red-500', 'hover:bg-destructive' `
        -replace 'hover:dark:bg-white/5', 'hover:bg-white/5' `
        -replace 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30', 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' `
        -replace 'hover:bg-red-100 dark:hover:bg-red-900/30', 'hover:bg-red-900/30'

    if ($newContent -cne $content) {
        Write-Host "Updating $($f.Name)"
        [IO.File]::WriteAllText($f.FullName, $newContent)
    }
}
