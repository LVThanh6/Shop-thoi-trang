Add-Type -AssemblyName System.Drawing
function Make-Grid() {
    [System.IO.FileInfo[]]$files = Get-ChildItem -Path "c:\HeThongWeb\Shop thời trang nam\Shop-thoi-trang\data\Phụ Kiện Nam" -Filter "*.webp" | Select-Object -First 5
    $imgWidth = 200
    $imgHeight = 200
    $cols = 5
    $bmp = New-Object System.Drawing.Bitmap ($cols * $imgWidth), $imgHeight
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)
    $font = New-Object System.Drawing.Font("Consolas", 12)
    $brush = [System.Drawing.Brushes]::Black
    for ($i = 0; $i -lt $files.Count; $i++) {
        $src = [System.Drawing.Image]::FromFile($files[$i].FullName)
        $g.DrawImage($src, ($i * $imgWidth), 0, $imgWidth, $imgHeight - 30)
        $g.DrawString($i.ToString(), $font, $brush, ($i * $imgWidth), $imgHeight - 30)
        $src.Dispose()
    }
    $bmp.Save("c:\HeThongWeb\Shop thời trang nam\Shop-thoi-trang\data\grid1.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Grid generated"
}
Make-Grid
