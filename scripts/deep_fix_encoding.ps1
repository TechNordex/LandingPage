
$replacements = @{
    'Ã£' = 'ã'
    'Ã§' = 'ç'
    'Ã¡' = 'á'
    'Ã©' = 'é'
    'Ã³' = 'ó'
    'Ãµ' = 'õ'
    'Ãª' = 'ê'
    'Ã´' = 'ô'
    'Ã¬' = 'ì'
    'Ã­' = 'í'
    'Ãº' = 'ú'
    'Ã€' = 'À'
    'Ã‚' = 'Â'
    'Ãƒ' = 'Ã'
    'á¢€ ‚¬á¢€ ‚¬' = '──'
    'á¢‚¬¢' = '•'
    '€”' = '—'
    'â€”' = '—'
}

$files = @('c:\Users\adson.vicente_murtac\Desktop\Landing Page da empresa\LandingPage\app\admin\page.tsx', 'c:\Users\adson.vicente_murtac\Desktop\Landing Page da empresa\LandingPage\app\dashboard\page.tsx')

foreach ($f in $files) {
    if (Test-Path $f) {
        $content = [System.IO.File]::ReadAllText($f)
        foreach ($key in $replacements.Keys) {
            $content = $content.Replace($key, $replacements[$key])
        }
        [System.IO.File]::WriteAllText($f, $content)
        Write-Host "Fixed encoding for $f"
    }
}
