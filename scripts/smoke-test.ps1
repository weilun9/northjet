<#
  NorthJet API smoke test
  Runs the full booking lifecycle + key validation rules against any environment.

  Usage (local):   .\scripts\smoke-test.ps1 -Seed
  Usage (online):  .\scripts\smoke-test.ps1 -BaseUrl "https://your-app.vercel.app" -Seed

  -Seed   : (re)seed the database before testing. Omit to test against existing data.
  The script cleans up after itself (cancels the booking it creates).
#>
param(
  [string]$BaseUrl = "http://localhost:3000",
  [switch]$Seed,
  [string]$SeedKey = ""   # required to seed a production deployment (= AUTH_SECRET)
)

$ErrorActionPreference = 'Stop'
$BaseUrl = $BaseUrl.TrimEnd('/')
$script:pass = 0
$script:fail = 0
# Shared cookie jar so auth session persists across requests.
$script:session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Req($method, $path, $body) {
  $url = "$BaseUrl$path"
  try {
    $p = @{ Method = $method; Uri = $url; TimeoutSec = 120; UseBasicParsing = $true; WebSession = $script:session }
    if ($body) { $p.Body = $body; $p.ContentType = 'application/json' }
    $r = Invoke-WebRequest @p
    return @{ Status = [int]$r.StatusCode; Body = $r.Content }
  } catch {
    $resp = $_.Exception.Response
    if ($resp) {
      $code = [int]$resp.StatusCode
      try {
        $sr = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $content = $sr.ReadToEnd()
      } catch { $content = '' }
      return @{ Status = $code; Body = $content }
    }
    return @{ Status = 0; Body = $_.Exception.Message }
  }
}

function Check($name, $cond, $detail) {
  if ($cond) { Write-Host "  [PASS] $name" -ForegroundColor Green; $script:pass++ }
  else { Write-Host "  [FAIL] $name  --  $detail" -ForegroundColor Red; $script:fail++ }
}

Write-Host "`n=== NorthJet smoke test ===" -ForegroundColor Cyan
Write-Host "Target: $BaseUrl`n"

# 0) Seed -----------------------------------------------------------------
if ($Seed) {
  Write-Host "[0] Seeding database..."
  $seedPath = if ($SeedKey) { "/api/seed?key=$SeedKey" } else { '/api/seed' }
  $s = Req 'POST' $seedPath
  $sb = if ($s.Body) { $s.Body | ConvertFrom-Json } else { $null }
  Check 'Seed returns 200'           ($s.Status -eq 200) "status=$($s.Status)"
  Check 'Seed reports flights count' ($sb.flights -gt 0) "flights=$($sb.flights)"
  Write-Host "      seeded flights=$($sb.flights) bookings=$($sb.bookings)`n"
}

$today = (Get-Date).ToString('yyyy-MM-dd')
$date2 = (Get-Date).AddDays(35).ToString('yyyy-MM-dd')
$email = "smoke.$(Get-Date -Format 'yyyyMMddHHmmss')@northjet.test"

# 1) Validation: missing params ------------------------------------------
Write-Host "[1] Search validation"
$r = Req 'GET' "/api/flights?orig=NZNE"
Check 'Missing dest -> 400' ($r.Status -eq 400) "status=$($r.Status)"

# 2) Validation: invalid route -------------------------------------------
$r = Req 'GET' "/api/flights?orig=YSSY&dest=NZRO&date1=$today&date2=$date2"
Check 'Invalid route YSSY->NZRO -> 400' ($r.Status -eq 400) "status=$($r.Status)"

# 3) Range search (Rotorua: twice daily, always has flights) -------------
Write-Host "[2] Flight search (NZNE -> NZRO)"
$r = Req 'GET' "/api/flights?orig=NZNE&dest=NZRO&date1=$today&date2=$date2"
$flights = if ($r.Body) { $r.Body | ConvertFrom-Json } else { @() }
Check 'Search returns 200'        ($r.Status -eq 200)   "status=$($r.Status)"
Check 'Search returns flights'    ($flights.Count -gt 0) "count=$($flights.Count)"
$flight = $flights | Where-Object { $_.availableSeats -gt 0 } | Select-Object -First 1
Check 'A flight with free seats'  ($null -ne $flight)   'no seats available'
if (-not $flight) { Write-Host "`nAborting: no bookable flight found." -ForegroundColor Yellow; exit 1 }
Write-Host "      using $($flight.flightNumber) seats=$($flight.availableSeats)/$($flight.totalSeats)`n"

# 4) Create booking -------------------------------------------------------
Write-Host "[3] Booking lifecycle"
$body = @{ flightId = $flight._id; passengerName = 'Smoke Test'; email = $email; phone = '+64 21 555 0000' } | ConvertTo-Json
$r = Req 'POST' '/api/bookings' $body
$booking = if ($r.Body) { $r.Body | ConvertFrom-Json } else { $null }
Check 'Create booking -> 201' ($r.Status -eq 201) "status=$($r.Status) body=$($r.Body)"
Check 'Booking ref looks valid' ($booking.bookingRef -match '^NJ[A-Z0-9]{7}$') "ref=$($booking.bookingRef)"
$ref = $booking.bookingRef
Write-Host "      created ref=$ref`n"

# 5) Duplicate prevented --------------------------------------------------
$r = Req 'POST' '/api/bookings' $body
Check 'Duplicate same email/flight -> 409' ($r.Status -eq 409) "status=$($r.Status)"

# 6) Fetch by email -------------------------------------------------------
$r = Req 'GET' "/api/bookings?email=$email"
# @() forces an array even when ConvertFrom-Json unwraps a single-element result.
$mine = @(if ($r.Body) { $r.Body | ConvertFrom-Json } else { @() })
$matched = @($mine | Where-Object { $_.bookingRef -eq $ref })
Check 'Fetch by email finds booking' ($matched.Count -ge 1) "matched=$($matched.Count) total=$($mine.Count)"

# 7) Fetch by ref ---------------------------------------------------------
$r = Req 'GET' "/api/bookings/$ref"
$one = if ($r.Body) { $r.Body | ConvertFrom-Json } else { $null }
Check 'Fetch by ref -> confirmed' ($one.status -eq 'confirmed') "status=$($one.status)"

# 8) Unknown ref ----------------------------------------------------------
$r = Req 'GET' '/api/bookings/NJ0000000'
Check 'Unknown ref -> 404' ($r.Status -eq 404) "status=$($r.Status)"

# 9) Cancel requires ownership (email or session) -------------------------
$r = Req 'DELETE' "/api/bookings/$ref"
Check 'Cancel without email -> 403' ($r.Status -eq 403) "status=$($r.Status)"
$r = Req 'DELETE' "/api/bookings/${ref}?email=$email"
Check 'Cancel with email -> 200' ($r.Status -eq 200) "status=$($r.Status)"
$r = Req 'GET' "/api/bookings/$ref"
$one = if ($r.Body) { $r.Body | ConvertFrom-Json } else { $null }
Check 'Status is cancelled' ($one.status -eq 'cancelled') "status=$($one.status)"

# 10) Double cancel -------------------------------------------------------
$r = Req 'DELETE' "/api/bookings/${ref}?email=$email"
Check 'Cancel again -> 400' ($r.Status -eq 400) "status=$($r.Status)"

# 11) Auth lifecycle ------------------------------------------------------
Write-Host "`n[4] Auth (register / session / login / logout)"
$authEmail = "auth.$(Get-Date -Format 'yyyyMMddHHmmss')@northjet.test"
$reg = @{ name = 'Smoke Auth'; email = $authEmail; password = 'secret123' } | ConvertTo-Json
$r = Req 'POST' '/api/auth/register' $reg
Check 'Register -> 201' ($r.Status -eq 201) "status=$($r.Status)"

$r = Req 'GET' '/api/auth/me'
$me = if ($r.Body) { $r.Body | ConvertFrom-Json } else { $null }
Check 'me returns user (cookie session)' ($me.user.email -eq $authEmail) "user=$($me.user.email)"

$r = Req 'POST' '/api/auth/register' $reg
Check 'Duplicate register -> 409' ($r.Status -eq 409) "status=$($r.Status)"

$bad = @{ email = $authEmail; password = 'wrongpass' } | ConvertTo-Json
$r = Req 'POST' '/api/auth/login' $bad
Check 'Wrong password -> 401' ($r.Status -eq 401) "status=$($r.Status)"

$r = Req 'POST' '/api/auth/logout'
Check 'Logout -> 200' ($r.Status -eq 200) "status=$($r.Status)"

$r = Req 'GET' '/api/auth/me'
$me = if ($r.Body) { $r.Body | ConvertFrom-Json } else { $null }
Check 'me is null after logout' ($null -eq $me.user) "user=$($me.user)"

$good = @{ email = $authEmail; password = 'secret123' } | ConvertTo-Json
$r = Req 'POST' '/api/auth/login' $good
Check 'Login -> 200' ($r.Status -eq 200) "status=$($r.Status)"

# Summary -----------------------------------------------------------------
Write-Host "`n=== Result: $script:pass passed, $script:fail failed ===" -ForegroundColor Cyan
if ($script:fail -gt 0) { exit 1 } else { Write-Host "All good. The seat booked during testing was cancelled (data left clean).`n" -ForegroundColor Green }
