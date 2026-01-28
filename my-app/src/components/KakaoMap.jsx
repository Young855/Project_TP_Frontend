// src/components/KakaoMap.jsx
import { useEffect, useRef } from "react";
import.meta.env.VITE_KAKAO_API_KEY


/**
 * KakaoMap
 * - props로 받은 위도/경도로 지도 표시 + 마커 1개 찍기
 *
 * 사용 예)
 * <KakaoMap lat={accommodation.latitude} lng={accommodation.longitude} />
 *
 * .env 예)
 * VITE_KAKAO_MAP_APP_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *
 * 주의)
 * - 카카오 지도 JS SDK는 "JavaScript 키"가 필요함 (REST 키 아님)
 * - 도메인 등록(카카오 개발자 콘솔 Web 플랫폼) 필요
 */
export default function KakaoMap({
  lat,
  lng,
  level = 3,          // 줌 레벨(작을수록 확대)
  markerText = "",     // 마커 위에 텍스트(옵션)
  className = "",
  style = {},
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    // 1) 좌표가 없으면 그리지 않음
    if (lat == null || lng == null) return;

    const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

    if (!KAKAO_APP_KEY) {
      console.error(
        "[KakaoMap] VITE_KAKAO_MAP_APP_KEY가 .env에 없습니다. (카카오 JavaScript 키)"
      );
      return;
    }

    // 2) 이미 스크립트가 로드된 경우(페이지 내 여러 지도 or 재방문) 바로 init
    if (window.kakao && window.kakao.maps) {
      initMap();
      return;
    }

    // 3) 스크립트 중복 로드 방지
    const existing = document.querySelector('script[data-kakao-map="true"]');
    if (existing) {
      existing.addEventListener("load", initMap);
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.dataset.kakaoMap = "true";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
    script.onload = () => initMap();
    script.onerror = () => {
      console.error("[KakaoMap] 카카오 지도 SDK 로드 실패");
    };

    document.head.appendChild(script);

    function initMap() {
      if (!mapRef.current) return;

      // autoload=false 이므로 명시적으로 load 호출
      window.kakao.maps.load(() => {
        const container = mapRef.current;
        const center = new window.kakao.maps.LatLng(Number(lat), Number(lng));

        const map = new window.kakao.maps.Map(container, {
          center,
          level,
        });

        // 마커
        const marker = new window.kakao.maps.Marker({
          position: center,
        });
        marker.setMap(map);

        // 마커 텍스트(오버레이)
        if (markerText) {
          const overlay = new window.kakao.maps.CustomOverlay({
            position: center,
            content: `
              <div style="
                padding:6px 10px;
                background:white;
                border:1px solid rgba(0,0,0,0.2);
                border-radius:8px;
                font-size:12px;
                box-shadow:0 2px 10px rgba(0,0,0,0.15);
                white-space:nowrap;
              ">
                ${escapeHtml(markerText)}
              </div>
            `,
            yAnchor: 1.6,
          });
          overlay.setMap(map);
        }

        // 지도 리사이즈 대응(탭/모달/스크롤 등에서 깨지는 경우 방지)
        // 필요하면 호출해서 중심 다시 잡기
        setTimeout(() => {
          window.kakao.maps.event.trigger(map, "resize");
          map.setCenter(center);
        }, 0);
      });
    }

    function escapeHtml(str) {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }
  }, [lat, lng, level, markerText]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        ...style,
      }}
    />
  );
}
