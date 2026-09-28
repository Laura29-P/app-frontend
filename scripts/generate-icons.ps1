$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$iconDirectory = Join-Path $PSScriptRoot '..\public\icons'
New-Item -ItemType Directory -Path $iconDirectory -Force | Out-Null
foreach ($icon in @(@{Size=192;Name='icon-192.png'}, @{Size=512;Name='icon-512.png'}, @{Size=512;Name='maskable-512.png'})) {
    $bitmap = New-Object System.Drawing.Bitmap($icon.Size, $icon.Size)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.ScaleTransform(($icon.Size / 512.0), ($icon.Size / 512.0))
    $blue = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#2563eb'))
    $pale = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#dbeafe'))
    $gold = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#fbbf24'))
    $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $line = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#93c5fd'), 9)
    $graphics.FillRectangle($blue, 0, 0, 512, 512)
    # All meaningful artwork stays inside the Android maskable safe circle.
    $left = [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(128,218),[System.Drawing.PointF]::new(244,238),[System.Drawing.PointF]::new(244,358),[System.Drawing.PointF]::new(128,338))
    $right = [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(268,238),[System.Drawing.PointF]::new(384,218),[System.Drawing.PointF]::new(384,338),[System.Drawing.PointF]::new(268,358))
    $graphics.FillPolygon($white, $left)
    $graphics.FillPolygon($pale, $right)
    $graphics.DrawLine($line,154,257,218,269)
    $graphics.DrawLine($line,154,287,218,299)
    $graphics.DrawLine($line,294,269,358,257)
    $graphics.DrawLine($line,294,299,358,287)
    $star = New-Object 'System.Collections.Generic.List[System.Drawing.PointF]'
    for ($i=0; $i -lt 10; $i++) {
        $radius = if ($i % 2 -eq 0) { 48 } else { 23 }
        $angle = -[Math]::PI/2 + $i*[Math]::PI/5
        $star.Add([System.Drawing.PointF]::new((256+$radius*[Math]::Cos($angle)),(166+$radius*[Math]::Sin($angle))))
    }
    $graphics.FillPolygon($gold, $star.ToArray())
    $bitmap.Save((Join-Path $iconDirectory $icon.Name), [System.Drawing.Imaging.ImageFormat]::Png)
    $line.Dispose(); $blue.Dispose(); $pale.Dispose(); $gold.Dispose(); $white.Dispose()
    $graphics.Dispose(); $bitmap.Dispose()
}
