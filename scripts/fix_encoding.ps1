# Fix double-encoded UTF-8 in admin/page.tsx
# The file was corrupted when PowerShell's Get-Content read UTF-8 as cp1252,
# then Set-Content -Encoding UTF8 wrote the already-decoded chars as UTF-8 again.
# To reverse: read current UTF-8 bytes -> interpret as Latin-1 string -> 
# encode back to get original UTF-8 bytes -> write as clean UTF-8

$filePath = "app\admin\page.tsx"

$rawBytes   = [System.IO.File]::ReadAllBytes($filePath)
$garbled    = [System.Text.Encoding]::UTF8.GetString($rawBytes)
$cp1252     = [System.Text.Encoding]::GetEncoding(1252)
$fixedBytes = $cp1252.GetBytes($garbled)
$cleanStr   = [System.Text.Encoding]::UTF8.GetString($fixedBytes)

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($filePath, $cleanStr, $utf8NoBom)

Write-Host "Done. Original size: $($rawBytes.Count) bytes -> Fixed size: $($fixedBytes.Count) bytes"
