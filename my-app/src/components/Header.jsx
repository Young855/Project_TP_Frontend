import { Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

/**
 * 헤더 컴포넌트 (Side Drawer 트리거 역할)
 * @param {object} props
 * @param {boolean} props.isLoggedIn - 로그인 여부
 * @param {function} props.navigate - useNavigate() 훅으로 전달된 페이지 이동 함수
 * @param {function} props.onOpenDrawer - 드로어를 여는 함수
 */
const Header = ({ isLoggedIn, navigate, onOpenDrawer }) => {
  const location = useLocation(); // 현재 페이지의 path, state등을 담고 있는 객체

  // SearchResultPage에서 navigate("/search", { state: { results, criteria } }) 이렇게 보넀다고 가정
  // 그 중에서 criteria만 꺼낸다.
  // location.state?.criteria -> location,state가 있을 때만 .criteria에 접근
  // criteria 안에는 destination, checkIn, checkOut, guests같은 검색 조건들이 들어 있을 것
  const criteria = location.state?.criteria;


  // 검색 수정 버튼 클릭 시: 메인으로 보내면서 기존 criteria 넘겨줌
  // 헤더 가운데 pill(검색 조건 요약 버튼)을 눌렀을 때 실행되는 함수
  // criteria가 없으면(안 넘어온 경우) 아무것도 못한다. 
  // 있으면 navigate('/', { state: { criteria } })
  // -> 메인페이지 / 로 이동
  // -> 이때 state로 criteria를 다시 넘김 -> 메인에서 기존 검색 조건을 폼에 미리 채워줄 때 쓸 수 있다.  state로 criteria를 다시 넘긴다는게 뭔소리고
  const handleModifySearch = () => {
    if (!criteria) return;
    navigate('/', { state: { criteria } });
  };

  // 검색 결과 페이지일 때만 pill 노출
  // 현재 URL 경로가 /search로 시작하는지 체크
  // 검색 결과 페이지일 때만 헤더 가운데에 pill(검색 조건 버튼)을 보여주려고 이 변수 사용
  const isSearchPage = location.pathname.startsWith('/search');

  // 로그인/회원가입 버튼 클릭 처리
  // /loginSelection 페이지로 이동시킨다
  const handleAuthClick = () => {
    navigate('/loginSelection');
  };

  // bg-white : 배경 흰색
  // shadow-sm : 아래에 약한 그림자 -> 헤더와 내용 영역 구분
  // sticky top-0 : 스크롤을 내려도 화면 맨 위(top 0)에 붙어있는 sticky 헤더
  // z-40 : 다른 요소들보다 위에 올라오도록 z-index 설정
  // container mx-auto : 가운데 정렬된 고정 폭 컨테이너
  // px-4 sm:px-6 lg:px-8 : 좌우 패딩(반응형 사이즈로 변경)
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 3분할 레이아웃 */}
        {/*
            flex : 가로방향 flexbox  
            item-center : 세로 방향 가운데 정렬
            h-16 : 높이 : 4rem(64px)
            w-full : 너비 100%
        */}
        <div className="flex items-center h-16 w-full">
          {/* 1) 왼쪽: TP 로고 */}
          {/*  
              w-1/3 : 전체 가로 폭의 1/3을 로고 영역으로 사용
              to="/" : 클릭 시 메인 페이지로 이동
              text-2xl font-bold text-blue-600
          */}

          <div className="flex items-center w-1/3">
            <Link
              to="/"
              className="text-2xl font-bold text-blue-600 cursor-pointer leading-none"
            >
              TP
            </Link>
          </div>

          {/* 2) 가운데 : 검색조건 pill */}
          <div className="hidden md:flex justify-center items-center w-1/3 mt-4">
            {isSearchPage && criteria && (
              <button
                type="button"
                onClick={handleModifySearch}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-[20px] text-gray-700"
              >
                <span>{criteria.destination}</span>
                <span className="w-px h-3 bg-gray-300" />
                <span>
                  {criteria.checkIn} ~ {criteria.checkOut}
                </span>
                <span className="w-px h-3 bg-gray-300" />
                <span>{criteria.guests}명</span>
              </button>
            )}
          </div>

          {/* 3) 오른쪽: 로그인/회원가입 + 햄버거 메뉴 */}
          <div className="flex items-center gap-2 w-1/3 justify-end">
            {!isLoggedIn && (
              <button
                onClick={handleAuthClick}
                className="btn-primary-outline px-4 py-2 rounded-lg text-sm font-semibold"
              >
                로그인/회원가입
              </button>
            )}

            <button onClick={onOpenDrawer} className="p-1">
              <Menu size={28} />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
