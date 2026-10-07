$ErrorActionPreference = 'Continue'
$base = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$out = Join-Path $base 'assets\portraits'
New-Item -ItemType Directory -Force -Path $out | Out-Null
$items = @(
  @{ Id='S01'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3814/S01_DwightFairfield_Portrait.png' }
  @{ Id='S02'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3813/S02_MegThomas_Portrait.png' }
  @{ Id='S03'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3815/S03_ClaudetteMorel_Portrait.png' }
  @{ Id='S04'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3812/S04_JakePark_Portrait.png' }
  @{ Id='S05'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3826/S05_NeaKarlsson_Portrait.png' }
  @{ Id='S06'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3825/S06_LaurieStrode_Portrait.png' }
  @{ Id='S07'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3824/S07_AceVisconti_Portrait.png' }
  @{ Id='S08'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3823/S08_WilliamBillOverbeck_Portrait.png' }
  @{ Id='S09'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3822/S09_FengMin_Portrait.png' }
  @{ Id='S10'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3821/S10_DavidKing_Portrait.png' }
  @{ Id='S11'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3820/S11_QuentinSmith_Portrait.png' }
  @{ Id='S12'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3819/S12_DetectiveDavidTapp_Portrait.png' }
  @{ Id='S13'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3818/S13_KateDenson_Portrait.png' }
  @{ Id='S14'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3817/S14_AdamFrancis_Portrait.png' }
  @{ Id='S15'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3816/S15_JeffJohansen_Portrait.png' }
  @{ Id='S16'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3811/S16_JaneRomero_Portrait.png' }
  @{ Id='S17'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3810/S17_AshleyJWilliams_Portrait.png' }
  @{ Id='S18'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3808/S18_SteveHarrington_Portrait.png' }
  @{ Id='S19'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3809/S19_NancyWheeler_Portrait.png' }
  @{ Id='S20'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3807/S20_YuiKimura_Portrait.png' }
  @{ Id='S21'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3806/S21_ZarinaKassir_Portrait.png' }
  @{ Id='S22'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3805/S22_CherylMason_Portrait.png' }
  @{ Id='S23'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3804/S23_FelixRichter_Portrait.png' }
  @{ Id='S24'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3803/S24_ElodieRakoto_Portrait.png' }
  @{ Id='S25'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3802/S25_YunJinLee_Portrait.png' }
  @{ Id='S26'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3801/S26_JillValentine_Portrait.png' }
  @{ Id='S27'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3800/S27_LeonSKennedy_Portrait.png' }
  @{ Id='S28'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3799/S28_MikaelaReid_Portrait.png' }
  @{ Id='S29'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3798/S29_JonahVasquez_Portrait.png' }
  @{ Id='S30'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3797/S30_YoichiAsakawa_Portrait.png' }
  @{ Id='S31'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3796/S31_HaddieKaur_Portrait.png' }
  @{ Id='S32'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3795/S32_AdaWong_Portrait.png' }
  @{ Id='S33'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3794/S33_RebeccaChambers_Portrait.png' }
  @{ Id='S34'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3793/S34_VittorioToscano_Portrait.png' }
  @{ Id='S35'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3792/S35_ThalitaLyra_Portrait.png' }
  @{ Id='S36'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3791/S36_RenatoLyra_Portrait.png' }
  @{ Id='S37'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3790/S37_GabrielSoma_Portrait.png' }
  @{ Id='S38'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3785/S38_NicolasCage_Portrait.png' }
  @{ Id='S39'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3862/S39_EllenRipley_Portrait.png' }
  @{ Id='S40'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4081/S40_AlanWake_Portrait.png' }
  @{ Id='S41'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4085/S41_SableWard_Portrait.png' }
  @{ Id='S42'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4089/S42_TheTroupe_Portrait.png' }
  @{ Id='S43'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4097/S43_LaraCroft_Portrait.png' }
  @{ Id='S44'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4093/S44_TrevorBelmont_Portrait.png' }
  @{ Id='S45'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4101/S45_TaurieCain_Portrait.png' }
  @{ Id='S46'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4245/S46_OrelaRose_Portrait.png' }
  @{ Id='S47'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4241/S47_RickGrimes_Portrait.png' }
  @{ Id='S48'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4237/S48_MichonneGrimes_Portrait.png' }
  @{ Id='S49'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4233/T_UI_S49_VeeBoonyasak_Portrait.png' }
  @{ Id='S50'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4229/T_UI_S50_DustinHenderson_Portrait.png' }
  @{ Id='S51'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4225/T_UI_S51_Eleven_Portrait.png' }
  @{ Id='S52'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4905/T_UI_S52_KwonTaeYoung_Portrait.png' }
  @{ Id='S53'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/6025/T_UI_S53_ShaneWiigwaas_Portrait.png' }
  @{ Id='S54'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/6141/T_UI_S54_Aurora_Portrait.png' }
  @{ Id='K01'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3858/K01_TheTrapper_Portrait.png' }
  @{ Id='K02'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3857/K02_TheWraith_Portrait.png' }
  @{ Id='K03'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3856/K03_TheHillbilly_Portrait.png' }
  @{ Id='K04'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3855/K04_TheNurse_Portrait.png' }
  @{ Id='K05'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3854/K05_TheHag_Portrait.png' }
  @{ Id='K06'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3853/K06_TheShape_Portrait.png' }
  @{ Id='K07'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3852/K07_TheDoctor_Portrait.png' }
  @{ Id='K08'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3851/K08_TheHuntress_Portrait.png' }
  @{ Id='K09'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3850/K09_TheCannibal_Portrait.png' }
  @{ Id='K10'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3849/K10_TheNightmare_Portrait.png' }
  @{ Id='K11'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3848/K11_ThePig_Portrait.png' }
  @{ Id='K12'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3847/K12_TheClown_Portrait.png' }
  @{ Id='K13'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3846/K13_TheSpirit_Portrait.png' }
  @{ Id='K14'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3845/K14_TheLegion_Portrait.png' }
  @{ Id='K15'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3844/K15_ThePlague_Portrait.png' }
  @{ Id='K16'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3843/K16_TheGhostface_Portrait.png' }
  @{ Id='K17'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3842/K17_TheDemogorgon_Portrait.png' }
  @{ Id='K18'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3841/K18_TheOni_Portrait.png' }
  @{ Id='K19'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3840/K19_TheDeathslinger_Portrait.png' }
  @{ Id='K20'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3839/K20_TheExecutioner_Portrait.png' }
  @{ Id='K21'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3838/K21_TheBlight_Portrait.png' }
  @{ Id='K22'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3837/K22_TheTwins_Portrait.png' }
  @{ Id='K23'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3836/K23_TheTrickster_Portrait.png' }
  @{ Id='K24'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3835/K24_TheNemesis_Portrait.png' }
  @{ Id='K25'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3834/K25_TheCenobite_Portrait.png' }
  @{ Id='K26'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3833/K26_TheArtist_Portrait.png' }
  @{ Id='K27'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3832/K27_TheOnryo_Portrait.png' }
  @{ Id='K28'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3831/K28_TheDredge_Portrait.png' }
  @{ Id='K29'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3830/K29_TheMasterMind_Portrait.png' }
  @{ Id='K30'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3829/K30_TheKnight_Portrait.png' }
  @{ Id='K31'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3828/K31_TheSkullMerchant_Portrait.png' }
  @{ Id='K32'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3827/K32_TheSingularity_Portrait.png' }
  @{ Id='K33'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3861/K33_TheXenomorph_Portrait.png' }
  @{ Id='K34'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/3949/K34_TheYerkes_Portrait.png' }
  @{ Id='K35'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4216/K35_TheUnknown_Portrait.png' }
  @{ Id='K36'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4217/K36_TheLich_Portrait.png' }
  @{ Id='K37'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4218/K37_TheDracula_Portrait.png' }
  @{ Id='K38'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4219/K38_TheHoundmaster_Portrait.png' }
  @{ Id='K39'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4220/K39_TheGhoul_Portrait.png' }
  @{ Id='K40'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4221/K40_TheAnimatronic_Portrait.png' }
  @{ Id='K41'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4222/T_UI_K41_TheKrasue_Portrait.png' }
  @{ Id='K42'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/4223/T_UI_K42_TheFirst_Portrait.png' }
  @{ Id='K43'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/5853/T_UI_K43_TheSlasher_Portrait.png' }
  @{ Id='K44'; Url='https://img.atwiki.jp/deadbydaylight/attach/409/6140/T_UI_K44_TheJudgment_Portrait.png' }
)
$ok=0; $fail=0; $total=$items.Count
for($i=0; $i -lt $items.Count; $i++){
  $item=$items[$i]
  $dest=Join-Path $out ($item.Id + '.png')
  Write-Host ('[{0}/{1}] {2}' -f ($i+1),$total,$item.Id) -ForegroundColor Cyan
  if(Test-Path $dest){ $ok++; continue }
  $clean=$item.Url -replace '^https?://',''
  $proxy='https://images.weserv.nl/?url=' + [uri]::EscapeDataString($clean) + '&w=480&h=480&fit=cover&output=png'
  try {
    Invoke-WebRequest -Uri $proxy -OutFile $dest -UseBasicParsing -TimeoutSec 45
    if((Get-Item $dest).Length -lt 1000){ throw 'Downloaded file is too small.' }
    $ok++
  } catch {
    if(Test-Path $dest){ Remove-Item $dest -Force -ErrorAction SilentlyContinue }
    try {
      Invoke-WebRequest -Uri $item.Url -OutFile $dest -UseBasicParsing -TimeoutSec 45
      if((Get-Item $dest).Length -lt 1000){ throw 'Downloaded file is too small.' }
      $ok++
    } catch {
      if(Test-Path $dest){ Remove-Item $dest -Force -ErrorAction SilentlyContinue }
      Write-Warning ('Failed: ' + $item.Id + ' / ' + $_.Exception.Message)
      $fail++
    }
  }
}
Write-Host ''
Write-Host ('완료: 성공 {0} / 실패 {1} / 전체 {2}' -f $ok,$fail,$total) -ForegroundColor Green
Write-Host 'assets\portraits 폴더에 저장되었습니다.'
if($fail -gt 0){ Write-Host '실패 항목은 스크립트를 다시 실행하면 재시도합니다.' -ForegroundColor Yellow }
# Direct file:// execution can taint Canvas when local bitmap files are drawn.
# Build a data-URI bundle so the downloaded portraits remain export-safe offline.
try {
  $bundlePath = Join-Path $base 'portrait-data.js'
  $pairs = New-Object System.Collections.Generic.List[string]
  foreach($item in $items){
    $dest = Join-Path $out ($item.Id + '.png')
    if(Test-Path $dest){
      $bytes = [System.IO.File]::ReadAllBytes($dest)
      $b64 = [Convert]::ToBase64String($bytes)
      $pairs.Add(('"{0}":"data:image/png;base64,{1}"' -f $item.Id,$b64))
    }
  }
  $js = 'window.EMBEDDED_PORTRAITS = {' + [string]::Join(',', $pairs) + '};' + [Environment]::NewLine
  [System.IO.File]::WriteAllText($bundlePath,$js,(New-Object System.Text.UTF8Encoding($false)))
  Write-Host ('오프라인 내장 데이터 생성: {0}명' -f $pairs.Count) -ForegroundColor Green
  Write-Host '이제 index.html을 직접 열어도 초상화와 PNG 저장을 오프라인에서 사용할 수 있습니다.' -ForegroundColor Green
} catch {
  Write-Warning ('portrait-data.js 생성 실패: ' + $_.Exception.Message)
}
