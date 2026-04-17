$dataDir = 'c:\HeThongWeb\Shop thời trang nam\Shop-thoi-trang\data'
$mappings = @{
    'perfumes.json' = 'Nước Hoa'
    'pants.json' = 'Quần'
    'shoes.json' = 'Giày'
    'caps.json' = 'Mũ Nam'
    'accessories.json' = 'Phụ Kiện Nam'
    'vests.json' = 'Vest'
    'watches.json' = 'Đồng Hồ'
}

foreach ($mapping in $mappings.GetEnumerator()) {
    $jsonFile = $mapping.Name
    $folderName = $mapping.Value
    $jsonPath = Join-Path $dataDir $jsonFile
    $folderPath = Join-Path $dataDir $folderName
    
    if (-not (Test-Path $jsonPath)) { continue }
    
    $jsonContent = Get-Content -Raw -Path $jsonPath -Encoding UTF8 | ConvertFrom-Json
    if ($jsonContent.Length -eq 0) { continue }
    
    $referencedImages = @{}
    $maxIdNum = 0
    $idPrefix = 'XXX'
    
    $templateTags = $jsonContent[0].tags
    
    foreach ($item in $jsonContent) {
        if ($item.img) {
            $imgName = Split-Path $item.img -Leaf
            $referencedImages[$imgName] = $true
        }
        
        if ($item.id -match "^([A-Za-z]+)(\d+)$") {
            $idPrefix = $matches[1]
            $num = [int]$matches[2]
            if ($num -gt $maxIdNum) { $maxIdNum = $num }
        }
    }
    
    $folderImages = @()
    if (Test-Path $folderPath) {
        $folderImages = Get-ChildItem -Path $folderPath | Where-Object { $_.Extension -match "\.(png|jpg|jpeg|webp|gif|avif|apng)$" } | Select-Object -ExpandProperty Name
    }
    
    $added = 0
    $newItemsList = New-Object System.Collections.ArrayList
    foreach ($item in $jsonContent) {
        [void]$newItemsList.Add($item)
    }

    foreach ($img in $folderImages) {
        if (-not $referencedImages.ContainsKey($img)) {
            $maxIdNum++
            $newId = "$idPrefix{0:D3}" -f $maxIdNum
            
            $newItem = [PSCustomObject]@{
                id = $newId
                name = "Sản phẩm $folderName $maxIdNum"
                price = 500000
                img = "../data/$folderName/$img"
                tags = $templateTags
            }
            [void]$newItemsList.Add($newItem)
            $added++
        }
    }
    
    if ($added -gt 0) {
        $jsonString = $newItemsList | ConvertTo-Json -Depth 10 
        Set-Content -Path $jsonPath -Value $jsonString -Encoding UTF8
        Write-Host "Updated $jsonFile with $added new items."
    }
}
