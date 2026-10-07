# GitHub 기존 저장소 업데이트 방법

현재 저장소 `dbd-profile-card-korea`에 v6를 덮어올릴 때 사용합니다.

1. GitHub 저장소의 **Add file → Upload files**를 엽니다.
2. 이 배포 폴더 안의 파일과 폴더를 **전체 선택하여 드래그**합니다.
3. 같은 이름의 파일은 새 버전으로 교체되고 `CHANGELOG.md`, `GITHUB_UPDATE.md`가 추가됩니다.
4. Commit message에 `v6: 1:1 SNS layout`을 입력합니다.
5. **Commit changes**를 누릅니다.
6. GitHub Pages가 활성화되어 있다면 보통 1~3분 뒤 자동 반영됩니다.
7. 이전 화면이 계속 보이면 브라우저를 새로고침하고, PWA로 설치했다면 앱을 완전히 종료 후 다시 엽니다. Service Worker 캐시는 v6로 갱신되어 있습니다.

> 주의: ZIP 파일 자체를 저장소 루트에 올리는 것이 아니라, 압축을 푼 **안쪽 파일 전체**를 업로드하세요. `index.html`이 저장소 최상위에 있어야 합니다.
