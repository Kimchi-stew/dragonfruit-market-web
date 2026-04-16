<div align="center">

# 🐉 용과마켓 

**감각적인 UI와 쫀득한 인터랙션의 프리미엄 쇼핑 경험**

[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## ✦ 프로젝트 소개

> *"리뷰를 확인하고 현명한 쇼핑을"*

용과마켓은 단순한 쇼핑몰이 아닙니다.  
스크롤 리빌, 스프링 호버, 메시 그라디언트 히어로까지 — **보는 것 자체가 즐거운** 이커머스 프론트엔드 프로젝트입니다.

뷰티·패션·식품·가전·스포츠·반려동물 6개 카테고리, 카테고리별 커스텀 필터, 실시간 검색, 장바구니부터 결제까지 이어지는 완전한 쇼핑 플로우를 담았습니다.

---

## ✦ 주요 화면

| 홈 | 상품 목록 | 상품 상세 |
|:---:|:---:|:---:|
| 슬라이딩 히어로 배너 | 카테고리별 필터 사이드바 | 이미지 갤러리 + 리뷰 |

| 장바구니 | 마이페이지 | 문의하기 |
|:---:|:---:|:---:|
| 수량·선택·주문 요약 | 주문·쿠폰·계정 설정 | 메일 형식 문의 폼 |

---

## ✦ 기능 하이라이트

```
🎠  히어로 배너     자동 슬라이드 + 진행 바 + 메시 그라디언트 + Bento 이미지 float
🗂️  스마트 필터     카테고리별 다른 필터셋 (chip / checkbox / color / range / rating)
🔍  실시간 검색     GNB 검색창 → 결과 페이지 카테고리 탭 필터
🛒  장바구니        선택 체크박스 · 수량 조절 · 할인/배송비 요약 실시간 반영
💳  결제 플로우     스텝 인디케이터 · 배송지 · 결제수단 · 동의 후 완료
👤  마이페이지      주문내역 · 찜 · 리뷰 · 문의 · 쿠폰 · 계정설정 섹션
🔔  알림 드롭다운   GNB 벨 아이콘 → 알림 없음 상태 처리
✉️  문의하기        메일 UI 형식 · 파일 첨부 · 제출 완료 화면
```

---

## ✦ 기술 스택

| 분류 | 사용 기술 |
|------|-----------|
| **프레임워크** | React 19 + TypeScript |
| **빌드** | Vite |
| **라우팅** | React Router v7 |
| **스타일링** | Tailwind CSS v4 + CSS 변수 디자인 토큰 |
| **아이콘** | Lucide React |
| **폰트** | Wanted Sans (본문) · 여기어때 잘난체 (로고) |

---

## ✦ 프로젝트 구조

```
src/
├── components/
│   ├── layout/       GNB (검색·알림·장바구니), Footer
│   ├── product/      ProductCard
│   └── ui/           Button, Input, StarRating, Pagination, Breadcrumb, CategoryChip
├── data/             mockProducts (6개 카테고리 · 54개 상품)
├── pages/
│   ├── HomePage          히어로 배너 · 카테고리 · 인기/신상/추천 상품
│   ├── ProductListPage   필터 사이드바 · 정렬 · 페이지네이션 · 검색 결과
│   ├── ProductDetailPage 이미지 갤러리 · 옵션 선택 · 리뷰
│   ├── CartPage          장바구니 관리 · 주문 요약
│   ├── CheckoutPage      배송지 · 결제수단 · 결제 완료
│   ├── LoginPage         이메일 로그인 · 카카오/네이버 소셜 로그인
│   ├── RegisterPage      회원가입 · 비밀번호 강도 · 약관 동의
│   ├── MyPage            주문내역 · 찜 · 리뷰 · 문의 · 쿠폰 · 계정설정
│   └── InquiryPage       메일 형식 문의 폼
├── App.tsx           라우팅
└── index.css         디자인 토큰 · 애니메이션 · 폰트
```

---

## ✦ 시작하기

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

개발 서버 실행 후 `http://localhost:5173` 에서 확인하세요.

---

<div align="center">

**용과처럼 강렬하게, 마켓처럼 다채롭게.**

</div>
