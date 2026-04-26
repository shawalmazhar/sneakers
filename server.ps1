$port = 8080
$path = "C:\Users\Chhus\.gemini\antigravity\scratch\aurax-sneaker-experience"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Listening on http://localhost:$port/"
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestUrl = $context.Request.Url.LocalPath
    if ($requestUrl -eq "/") { $requestUrl = "/index.html" }
    $filePath = Join-Path $path $requestUrl
    
    if (Test-Path $filePath -PathType Leaf) {
        $buffer = [System.IO.File]::ReadAllBytes($filePath)
        
        $ext = [System.IO.Path]::GetExtension($filePath)
        if ($ext -eq ".html") { $context.Response.ContentType = "text/html" }
        elseif ($ext -eq ".css") { $context.Response.ContentType = "text/css" }
        elseif ($ext -eq ".js") { $context.Response.ContentType = "application/javascript" }
        
        $context.Response.ContentLength64 = $buffer.Length
        $context.Response.OutputStream.Write($buffer, 0, $buffer.Length)
        $context.Response.StatusCode = 200
    } else {
        $context.Response.StatusCode = 404
    }
    $context.Response.Close()
}
