import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPropertiesByPartnerId } from '../api/propertyAPI'; 
import { getPartner } from '../api/partnerAPI'; 

const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [properties, setProperties] = useState([]); 
  const [currentProperty, setCurrentProperty] = useState(null); 
  const [partnerInfo, setPartnerInfo] = useState({ 
      partnerId: null, 
      bizName: '', 
      ceoName: '' 
  });
  const [isLoading, setIsLoading] = useState(true);

  // [핵심 수정] 데이터를 불러오는 로직을 별도 함수로 분리 (재사용 가능하도록)
  const loadPartnerData = async () => {
    const storedPartnerId = localStorage.getItem('partnerId') || 1; 

    try {
      setIsLoading(true);

      // 1. 파트너 정보와 숙소 목록을 병렬로 조회
      const [pInfo, pList] = await Promise.all([
          getPartner(storedPartnerId),
          getPropertiesByPartnerId(storedPartnerId)
      ]);

      setPartnerInfo(pInfo);
      
      // API가 null을 반환할 경우를 대비해 빈 배열 처리
      const safeList = Array.isArray(pList) ? pList : [];
      setProperties(safeList);

      // 2. 현재 선택된 숙소 결정 로직
      if (safeList.length === 0) {
          // 숙소가 하나도 없으면 무조건 null (그래야 환영 메시지가 뜸)
          setCurrentProperty(null);
          localStorage.removeItem('lastSelectedPropertyId');
      } else {
          // 기존에 선택했던 숙소 ID가 유효한지 확인
          const savedPropId = localStorage.getItem('lastSelectedPropertyId');
          
          // 1순위: 저장된 ID와 일치하는 숙소 찾기
          // 2순위: 리스트의 첫 번째 숙소
          const target = safeList.find(p => p.propertyId === Number(savedPropId)) || safeList[0];
          
          setCurrentProperty(target);
          localStorage.setItem('lastSelectedPropertyId', target.propertyId);
      }

    } catch (error) {
      console.error("파트너 데이터 로딩 실패:", error);
      setProperties([]); // 에러 발생 시 안전하게 빈 배열로 초기화
      setCurrentProperty(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 최초 1회 실행
  useEffect(() => {
    loadPartnerData();
  }, []);

  const switchProperty = (property) => {
    setCurrentProperty(property);
    if (property) {
        localStorage.setItem('lastSelectedPropertyId', property.propertyId);
    }
  };

  return (
    <PartnerContext.Provider value={{ 
        properties, 
        currentProperty, 
        switchProperty, 
        partnerInfo,
        isLoading,
        refreshPartnerData: loadPartnerData // [추가] 외부에서 호출할 수 있도록 내보냄
    }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);