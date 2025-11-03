import { Outlet, Link } from "react-router-dom";

// Outlet : 중첩된 라우팅(child routes)가 랜더링 될 위치를 정의
// 부모 컴포넌트에 Outlet을 적용하면, 자식 라우트(children)의 컴포넌트가 그 위치에 렌더링됨
// Link : html의 a 태그와 유사. SPA 방식으로 라우팅

export default function Layout(){
    return(
        <div>
            <header>
                <nav>
                <NavItem path="/itinerary">내 일정</NavItem>
        
                <NavItem path="/community">커뮤니티</NavItem>

                <NavItem path="/property/properties">숙소 등록</NavItem>

                <NavItem path="/user/mypage">마이페이지</NavItem>


                {isLoggedIn ? (  
                <>
                <NavItem path="/user/mypage">
                <User size={20} className="inline-block mr-1" />
                마이페이지
                </NavItem>

                {/* 로그아웃은 onLogout 함수(App.jsx에서 Modal 띄우는 로직 포함)를 사용 */}
                <NavItem path="/" onClick={onLogout} className={linkClass}>
                <LogOut size={20} className="inline-block mr-1" />
                로그아웃
                </NavItem>
                </>
                ) : (
                <>
                
                <NavItem path="/login">
                <LogIn size={20} className="inline-block mr-1" />
                로그인
                </NavItem>
                <NavItem path="user/signup" className={buttonClass}>
                <UserPlus size={20} className="inline-block mr-1" />
                회원가입
                </NavItem>
                </>
                )}

                </nav>
            </header>
            <main>
                <Outlet /> {/* 자식 라우트로 설정된 컴포넌트가 랜더링됨 */}
            </main>
            <footer>

            </footer>
        </div>
    );
}
