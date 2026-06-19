# ============================================================
#  Vanto - Tam Otomatik Kurulum (Windows / PowerShell)
#  Python 3.12 + PostgreSQL 16 (yoksa indirir-kurar), DB + .env +
#  sema + admin + frontend + firewall + servis. Sonunda erisim adresi.
#
#  NOT: Sessiz installer URL/surumleri zamanla degisebilir. Sorun olursa
#  asagidaki $PythonUrl / $PgUrl degerlerini guncelle.
# ============================================================
$ErrorActionPreference = "Stop"

# TLS 1.2'yi etkinlestir — Windows Server'da python.org/postgres indirmesi
# "SSL/TLS guvenli kanali olusturulamadi" hatasi vermesin.
try {
  [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch { }

# ---- Ayarlar (gerekirse degistir) ----
$Port        = 8000
$DbName      = "perpak_teklif"
$DbUser      = "perpak"
$PythonUrl   = "https://www.python.org/ftp/python/3.12.7/python-3.12.7-amd64.exe"
$PgUrl       = "https://get.enterprisedb.com/postgresql/postgresql-16.4-1-windows-x64.exe"
$PgVer       = "16"

# ---- Yollar ----
$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path   # backend'in ust klasoru
$Backend = Join-Path $AppRoot "backend"
$StateDir = $PSScriptRoot
$PgPassFile = Join-Path $StateDir ".pg_super.txt"
$DbPassFile = Join-Path $StateDir ".db_pass.txt"
$Tmp = Join-Path $env:TEMP "vanto_kurulum"
New-Item -ItemType Directory -Force -Path $Tmp | Out-Null

function Step($m) { Write-Host "`n=== $m ===" -ForegroundColor Cyan }
function Info($m) { Write-Host "  $m" -ForegroundColor Gray }
function Ok($m)   { Write-Host "  OK: $m" -ForegroundColor Green }

Write-Host "============================================" -ForegroundColor Yellow
Write-Host "  VANTO - Otomatik Kurulum" -ForegroundColor Yellow
Write-Host "  Uygulama klasoru: $AppRoot" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

if (-not (Test-Path $Backend)) {
  throw "backend klasoru bulunamadi: $Backend  (kurulum.bat'i ZIP icindeki deploy\windows klasorunden calistirin)"
}

# ---- Sifreler (ilk kurulumda uret, sonra dosyadan oku - idempotent) ----
function NewPass { -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 24 | ForEach-Object {[char]$_}) }
if (Test-Path $PgPassFile) { $PgSuperPass = Get-Content $PgPassFile -Raw } else { $PgSuperPass = NewPass; $PgSuperPass | Out-File $PgPassFile -NoNewline -Encoding ascii }
if (Test-Path $DbPassFile) { $DbPass = Get-Content $DbPassFile -Raw } else { $DbPass = NewPass; $DbPass | Out-File $DbPassFile -NoNewline -Encoding ascii }
$PgSuperPass = $PgSuperPass.Trim(); $DbPass = $DbPass.Trim()

# ============================================================
# 1) PYTHON 3.12
# ============================================================
Step "Python 3.12 kontrol"
$PyExe = $null

# 1) Bilinen kurulum yollari (en guvenilir — PATH/Store karmasasina takilmaz)
foreach ($p in @(
    "$env:ProgramFiles\Python312\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "$env:ProgramFiles\Python313\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe"
)) {
  if (Test-Path $p) { $PyExe = $p; break }
}

# 2) 'py' launcher (Windows) — Microsoft Store sahte stub'una TAKILMAZ
if (-not $PyExe -and (Get-Command py -ErrorAction SilentlyContinue)) {
  foreach ($arg in @("-3.12", "-3")) {
    try {
      $src = (& py $arg -c "import sys; print(sys.executable)" 2>$null)
      if ($LASTEXITCODE -eq 0 -and $src -and (Test-Path $src)) {
        $ver = (& $src --version 2>&1)
        if ($ver -match "3\.1[2-9]") { $PyExe = $src; break }
      }
    } catch { }   # py o surumu bulamazsa sessizce gec
  }
}

# 3) PATH'teki python.exe — AMA Microsoft Store "App Execution Alias" stub'unu ATLA
#    (WindowsApps altindaki 0-byte stub calistirilinca "Sistem dosyaya erisemiyor" verir)
if (-not $PyExe) {
  $pyCmd = Get-Command python.exe -All -ErrorAction SilentlyContinue |
           Where-Object { $_.Source -and $_.Source -notlike "*\WindowsApps\*" } |
           Select-Object -First 1
  if ($pyCmd) {
    try {
      $ver = (& $pyCmd.Source --version 2>&1)
      if ($ver -match "3\.1[2-9]") { $PyExe = $pyCmd.Source }
    } catch { }
  }
}
if (-not $PyExe) {
  Info "Python yok, indiriliyor..."
  $pyInst = Join-Path $Tmp "python312.exe"
  Invoke-WebRequest -Uri $PythonUrl -OutFile $pyInst
  Info "Sessiz kuruluyor (tum kullanicilar, PATH)..."
  Start-Process -FilePath $pyInst -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1 Include_pip=1 Include_test=0" -Wait
  $PyExe = "$env:ProgramFiles\Python312\python.exe"
}
if (-not (Test-Path $PyExe)) { throw "Python kurulamadi. Elle kurup tekrar deneyin: $PythonUrl" }
Ok "Python: $PyExe"

# ============================================================
# 2) POSTGRESQL 16
# ============================================================
Step "PostgreSQL $PgVer kontrol"
$PgBin = "$env:ProgramFiles\PostgreSQL\$PgVer\bin"
$Psql  = Join-Path $PgBin "psql.exe"
if (-not (Test-Path $Psql)) {
  Info "PostgreSQL yok, indiriliyor (buyuk dosya, surebilir)..."
  $pgInst = Join-Path $Tmp "postgresql.exe"
  Invoke-WebRequest -Uri $PgUrl -OutFile $pgInst
  Info "Sessiz kuruluyor (port 5432)..."
  Start-Process -FilePath $pgInst -ArgumentList @(
    "--mode","unattended","--unattendedmodeui","minimal",
    "--superpassword",$PgSuperPass,"--servicename","postgresql-$PgVer",
    "--serverport","5432","--enable-components","server,commandlinetools"
  ) -Wait
}
if (-not (Test-Path $Psql)) { throw "PostgreSQL kurulamadi. Elle kurup tekrar deneyin: $PgUrl" }
Ok "PostgreSQL: $PgBin"

# Servis calisiyor mu?
$svc = Get-Service "postgresql-$PgVer*" -ErrorAction SilentlyContinue
if ($svc -and $svc.Status -ne "Running") { Start-Service $svc.Name; Start-Sleep 3 }

# ============================================================
# 3) VERITABANI + KULLANICI (idempotent)
# ============================================================
Step "Veritabani ve kullanici"
$env:PGPASSWORD = $PgSuperPass
& $Psql -U postgres -h localhost -p 5432 -c "CREATE ROLE $DbUser LOGIN PASSWORD '$DbPass';" 2>$null
& $Psql -U postgres -h localhost -p 5432 -c "ALTER ROLE $DbUser PASSWORD '$DbPass';" 2>$null
& $Psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE $DbName OWNER $DbUser;" 2>$null
& $Psql -U postgres -h localhost -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE $DbName TO $DbUser;" 2>$null
Ok "DB: $DbName / kullanici: $DbUser"

# ============================================================
# 4) BACKEND: venv + bagimliliklar
# ============================================================
Step "Backend bagimliliklari"
Push-Location $Backend
if (-not (Test-Path ".venv\Scripts\python.exe")) { & $PyExe -m venv .venv }
$VenvPy = Join-Path $Backend ".venv\Scripts\python.exe"
& $VenvPy -m pip install --upgrade pip --quiet
& $VenvPy -m pip install -r requirements.txt --quiet
Ok "Bagimliliklar kuruldu"

# ============================================================
# 5) .env (oto SECRET_KEY + IP)
# ============================================================
Step ".env olusturuluyor"
$Ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
       Where-Object { $_.IPAddress -notlike "169.*" -and $_.IPAddress -ne "127.0.0.1" } |
       Select-Object -First 1).IPAddress
if (-not $Ip) { $Ip = "localhost" }
$Secret = -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
$envPath = Join-Path $Backend ".env"
@"
DATABASE_URL=postgresql+psycopg://$DbUser`:$DbPass@localhost:5432/$DbName
SECRET_KEY=$Secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://$Ip`:$Port,http://localhost:$Port
APP_NAME=Vanto
APP_ENV=production
LOG_LEVEL=INFO
SMTP_ENABLED=false
SEED_DEMO=false
"@ | Out-File $envPath -Encoding ascii -Force
Ok ".env yazildi (DB + IP $Ip + rastgele SECRET)"

# ============================================================
# 6) Sema + admin + master veri
# ============================================================
Step "Veritabani semasi ve baslangic verisi"
& $VenvPy -m alembic upgrade head
& $VenvPy scripts\create_admin.py
& $VenvPy scripts\seed_master_data.py
Ok "Sema kuruldu, admin/admin123 hazir, master veri yuklendi"

# ============================================================
# 7) Frontend (paket icinde hazir 'static' gelir)
# ============================================================
Step "Frontend"
if (Test-Path (Join-Path $Backend "static\index.html")) {
  Ok "Hazir frontend (static) mevcut"
} elseif (Test-Path (Join-Path $AppRoot "frontend\dist\index.html")) {
  Copy-Item (Join-Path $AppRoot "frontend\dist\*") (Join-Path $Backend "static") -Recurse -Force
  Ok "frontend\dist -> backend\static kopyalandi"
} else {
  Write-Host "  UYARI: Frontend build (static) bulunamadi. Sadece API calisir." -ForegroundColor Yellow
}
Pop-Location

# ============================================================
# 8) Firewall (port ac)
# ============================================================
Step "Firewall"
Remove-NetFirewallRule -DisplayName "Vanto $Port" -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "Vanto $Port" -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow | Out-Null
Ok "Port $Port acildi"

# ============================================================
# 9) Servis (acilista otomatik baslar) - Gorev Zamanlayici
# ============================================================
Step "Otomatik baslatma servisi"
$taskName = "Vanto"
$action  = New-ScheduledTaskAction -Execute $VenvPy -Argument "-m uvicorn app.main:app --host 0.0.0.0 --port $Port" -WorkingDirectory $Backend
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest -User "SYSTEM" -Force | Out-Null
Start-ScheduledTask -TaskName $taskName
Start-Sleep 4
Ok "Servis kuruldu ve baslatildi (sunucu yeniden baslasa da otomatik kalkar)"

# ============================================================
# BITTI
# ============================================================
Write-Host "`n============================================" -ForegroundColor Green
Write-Host "  KURULUM TAMAM" -ForegroundColor Green
Write-Host "  Erisim:  http://$Ip`:$Port" -ForegroundColor Green
Write-Host "  Giris :  admin / admin123  (ilk girişte sifre degistirin)" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Durdur/baslat: Gorev Zamanlayici > '$taskName'  veya  baslat.bat" -ForegroundColor Gray
