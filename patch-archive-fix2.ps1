param()
$path = 'C:\Users\user\OneDrive\Desktop\Contradiction of S AR project\web\js\archive-cloud.js'
$L = [System.IO.File]::ReadAllLines($path, [System.Text.Encoding]::UTF8)
Write-Host ("Lines before fix2: " + [string]$L.Length)

# --- Fix C-767: restore real addTrace call with isNew=true (index 767) ---
$L[767] = '    _addToGarden(trace, !!(highlightId && trace.id === highlightId), true);'
Write-Host ("Fix C-767: " + $L[767])

# --- Fix C-766: restore missing addTrace function header (index 766) ---
$L[766] = '  function addTrace(trace) {'
Write-Host ("Fix C-766: " + $L[766])

# --- Fix A-706: restore destructuring closing line (index 706) ---
$L[706] = '            labelText, strokeArc } = result;'
Write-Host ("Fix A-706: " + $L[706])

# --- Fix A-705: restore skelFrames/skelCanvas/skelCtx/skelSeed line (index 705) ---
$L[705] = '            skelFrames, skelCanvas, skelCtx, skelSeed,'
Write-Host ("Fix A-705: " + $L[705])

# --- Fix B-698: delete duplicate _addToGarden function header (index 698) ---
$L = $L[0..697] + $L[699..($L.Length-1)]
Write-Host ("After Fix B deletion: " + [string]$L.Length)

# Verify the final sections
Write-Host ""
Write-Host "=== Verify: _addToGarden sig + destructuring ==="
for ($i = 695; $i -le 710; $i++) { Write-Host ([string]$i + ": " + $L[$i]) }
Write-Host ""
Write-Host "=== Verify: addTrace function ==="
for ($i = 762; $i -le 776; $i++) { Write-Host ([string]$i + ": " + $L[$i]) }

# Write back
$utf8NoBOM = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, ($L -join "`n") + "`n", $utf8NoBOM)
Write-Host "Fix2 complete."
