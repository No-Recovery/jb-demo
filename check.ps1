# Проверка сценария: рендерит страницу в headless Chrome и сверяет DOM.
# Запуск: powershell -NoProfile -ExecutionPolicy Bypass -File .\check.ps1
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'

$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$dir    = Join-Path $PSScriptRoot 'site'
$url    = 'file:///' + ($dir -replace '\\', '/') + '/index.html'

function Get-Dom([string]$step) {
  $o = Join-Path $env:TEMP ("dmp-" + $step + ".html")
  $ErrorActionPreference = 'Continue'
  & $chrome --headless=new --disable-gpu --no-first-run `
            --virtual-time-budget=4000 --dump-dom "$url#$step" 2>$null |
    Out-File -FilePath $o -Encoding utf8
  $ErrorActionPreference = 'Stop'
  Get-Content -LiteralPath $o -Raw -Encoding utf8
}

$script:fail = 0
function Check([string]$step, [string]$what, [bool]$ok) {
  if (-not $ok) { $script:fail++ }
  "{0}  {1,-11} {2}" -f $(if ($ok) { 'OK  ' } else { 'FAIL' }), $step, $what
}

$ALL = @('lock','home','dopamine','jbreaking','jbdone','packages','installing','newicons','manager')

# ── 1. Скрипт отрабатывает без ошибок
foreach ($s in $ALL) {
  $dom = Get-Dom $s
  Check $s 'JS без ошибок'        (-not $dom.Contains('data-js-error'))
  Check $s 'нет баннера fatal'    (-not $dom.Contains('class="fatal"'))
  Check $s 'масштаб вычислен'    ($dom -match '--scale')
}

# ── 2. Активный экран соответствует шагу
$expect = [ordered]@{
  'lock'='lock'; 'home'='home'; 'dopamine'='dopamine'; 'jbreaking'='jbreaking'
  'jbdone'='jbdone'; 'packages'='packages'; 'installing'='installing'
  'newicons'='home'; 'manager'='manager'
}
foreach ($s in $expect.Keys) {
  $dom    = Get-Dom $s
  $active = [regex]::Matches($dom, 'class="screen[^"]*is-active"[^>]*data-screen="([a-z]+)"')
  Check $s ("активный экран = " + $expect[$s]) `
           ($active.Count -eq 1 -and $active[0].Groups[1].Value -eq $expect[$s])
}

# ── 3. Наполнение экранов
$dom = Get-Dom 'home'
$icons = [regex]::Matches($dom, '<div class="icon[ "]').Count
Check 'home' "иконок 14 (10 сетка + 4 док) — $icons" ($icons -eq 14)
Check 'home' 'значок Dopamine кликабелен' ($dom -match 'data-goto="dopamine"')
Check 'home' 'док отрисован' ($dom.Contains('class="home__dock"'))
Check 'home' 'новых иконок пока нет' (-not $dom.Contains('icon--new'))

$dom = Get-Dom 'dopamine'
Check 'dopamine' 'кнопка запуска джейлбрейка' ($dom -match 'id="jbButton"')
Check 'dopamine' '4 пункта меню' `
  ([regex]::Matches($dom, '<li><svg class="ic ic--sm"><use href="#i-').Count -eq 4)
Check 'dopamine' 'инфо об устройстве' ($dom.Contains('A15 Bionic'))
Check 'dopamine' 'статус «не установлен»' ($dom.Contains('не установлен'))

$dom = Get-Dom 'jbdone'
Check 'jbdone' 'сообщение об активном джейлбрейке' ($dom.Contains('Джейлбрейк активен'))
Check 'jbdone' 'пункт о менеджере пакетов' ($dom.Contains('Менеджер пакетов не установлен'))
Check 'jbdone' 'кнопка перехода к пакетам' ($dom -match 'data-goto="packages"')

$dom = Get-Dom 'packages'
$rows = [regex]::Matches($dom, '<li class="pkgrow[^"]*" data-pkg="').Count
Check 'packages' "7 пакетов в списке — $rows" ($rows -eq 7)
Check 'packages' 'Sileo отмечен по умолчанию' ($dom -match 'pkgrow is-on" data-pkg="sileo"')
Check 'packages' 'WipeCode отмечен по умолчанию' ($dom -match 'pkgrow is-on" data-pkg="wipecode"')
Check 'packages' 'Zebra не отмечен' ($dom -match 'class="pkgrow" data-pkg="zebra"')
Check 'packages' 'счётчик выбора' ($dom.Contains('2 выбрано'))

$dom = Get-Dom 'newicons'
Check 'newicons' 'новые иконки появились' ($dom.Contains('icon--new'))
Check 'newicons' 'иконка Sileo на месте' ($dom -match 'icon--new[^>]*data-pkg="sileo"')

$dom = Get-Dom 'manager'
Check 'manager' 'заголовок = Sileo' ($dom -match 'id="managerName">Sileo<')
Check 'manager' 'список установленного' ($dom.Contains('pkgrow--flat'))
$mgrRows = [regex]::Matches($dom, '<li class="pkgrow pkgrow--flat').Count
Check 'manager' "2 установленных пакета — $mgrRows" ($mgrRows -eq 2)
Check 'manager' 'кнопка «Заново»' ($dom.Contains('Заново'))

# ── 4. Панель шагов
$dom = Get-Dom 'manager'
$chips = [regex]::Matches($dom, '<button class="stepchip').Count
Check 'manager' "9 шагов в панели — $chips" ($chips -eq 9)
Check 'manager' 'последний шаг активен' ($dom -match 'stepchip is-on"><span class="stepchip__n">9<')
Check 'manager' 'предыдущие шаги отмечены' ([regex]::Matches($dom, 'stepchip is-done').Count -eq 8)

''
if ($script:fail -eq 0) { "ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ" } else { "ПРОВАЛЕНО ПРОВЕРОК: $script:fail" }
exit $script:fail