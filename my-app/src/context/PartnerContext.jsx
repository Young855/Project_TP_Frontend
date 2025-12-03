import React, { createContext, useContext, useState, useEffect } from 'react';
// [수정] API 함수명 변경
import { getAccommodationsByPartnerId } from '../api/accommodationAPI'; 
import { getPartner } from '../api/partnerAPI'; 

const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  // [수정] 상태 변수명 변경 (properties -> accommodations)
  const [accommodations, setAccommodations] = useState([]); 
  // [수정] 상태 변수명 변경 (currentProperty -> currentAccommodation)
  const [currentAccommodation, setCurrentAccommodation] = useState(null); 
  const [partnerInfo, setPartnerInfo] = useState({ 
      partnerId: null, 
      bizName: '', 
      ceoName: '' 
  });
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드 함수
  const loadPartnerData = async () => {
    const storedPartnerId = localStorage.getItem('partnerId') || 1; 

    try {
      setIsLoading(true);

      // 1. 파트너 정보와 숙소 목록을 병렬로 조회
      const [pInfo, pList] = await Promise.all([
          getPartner(storedPartnerId),
          getAccommodationsByPartnerId(storedPartnerId) // [수정]
      ]);

      setPartnerInfo(pInfo);
      
      const safeList = Array.isArray(pList) ? pList : [];
      setAccommodations(safeList); // [수정]

      // 2. 현재 선택된 숙소 결정 로직
      if (safeList.length === 0) {
          setCurrentAccommodation(null); // [수정]
          localStorage.removeItem('lastSelectedAccommodationId'); // [수정] 키값 변경
      } else {
          // [수정] 키값 변경
          const savedId = localStorage.getItem('lastSelectedAccommodationId');
          
          // 1순위: 저장된 ID와 일치하는 숙소 찾기 (accommodationId 기준)
          // 2순위: 리스트의 첫 번째 숙소
          const target = safeList.find(p => p.accommodationId === Number(savedId)) || safeList[0];
          
          setCurrentAccommodation(target); // [수정]
          localStorage.setItem('lastSelectedAccommodationId', target.accommodationId); // [수정]
      }

    } catch (error) {
      console.error("파트너 데이터 로딩 실패:", error);
      setAccommodations([]); // [수정]
      setCurrentAccommodation(null); // [수정]
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerData();
  }, []);

  // [수정] 함수명 및 파라미터 변경
  const switchAccommodation = (accommodation) => {
    setCurrentAccommodation(accommodation);
    if (accommodation) {
        localStorage.setItem('lastSelectedAccommodationId', accommodation.accommodationId);
    }
  };

  return (
    <PartnerContext.Provider value={{ 
        accommodations,      // [수정]
        currentAccommodation,// [수정]
        switchAccommodation, // [수정]
        partnerInfo,
        isLoading,
        refreshPartnerData: loadPartnerData 
    }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);