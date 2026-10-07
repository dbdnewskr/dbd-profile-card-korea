# GitHub 업데이트 방법

저장소 루트에 아래 파일을 업로드해서 기존 파일을 교체하세요.

- app.js
- index.html
- sw.js
- data.js

추천 커밋 메시지:
`start profile card with blank fields`

변경 내용:
- 일반 링크로 새로 접속하면 모든 프로필 입력값을 빈 상태에서 시작
- 최고 등급은 `미설정`, 플랫폼/캐릭터/VC/한마디는 선택 없음으로 시작
- 새로고침 중에는 같은 탭의 임시 작성 내용을 유지
- 공유 링크(#p=...)는 공유된 프로필 데이터를 그대로 불러옴
- 과거 localStorage에 저장된 예시 프로필은 더 이상 자동으로 불러오지 않음
- Service Worker 캐시 갱신
