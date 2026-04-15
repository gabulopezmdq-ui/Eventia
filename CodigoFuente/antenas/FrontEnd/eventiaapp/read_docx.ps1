Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("documentos\Eventia-Planes-Pagos-Prospectos-B2B.docx")
$entry = $zip.GetEntry("word/document.xml")
$reader = New-Object System.IO.StreamReader($entry.Open())
$xml = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()
$text = $xml -replace "<[^>]+>", " " -replace "\s+", " "
Set-Content -Path "docx_output.txt" -Value $text -Encoding UTF8
