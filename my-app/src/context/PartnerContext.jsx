import { createContext, useContext, useState, useEffect } from 'react';
import { getAccommodationsByPartnerId } from '../api/accommodationAPI'; 
import { getPartner } from '../api/partnerAPI'; 

const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [accommodations, setAccommodations] = useState([]); 
  const [currentAccommodation, setCurrentAccommodation] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  const partnerInfo = {
      get partnerId() { return localStorage.getItem('partnerId'); },
      get bizName() { return localStorage.getItem('bizName') || ''; },
      get ceoName() { return localStorage.getItem('ceoName')}, 
      get email() { return localStorage.getItem('email') || ''; }
  };

  const loadPartnerData = async () => {
    const storedPartnerId = localStorage.getItem('partnerId');
    if (!storedPartnerId) {
        setIsLoading(false);
        return;
    }

    try {
      setIsLoading(true);

      // 1. 병렬 조회
      const [pInfo, pList] = await Promise.all([
          getPartner(storedPartnerId),
          getAccommodationsByPartnerId(storedPartnerId)
      ]);

      // ✅ [핵심 변경] State에 저장하는 대신 localStorage에 저장
      if (pInfo) {
          localStorage.setItem('bizName', pInfo.bizName);
          localStorage.setItem('ceoName', pInfo.ceoName); // 혹은 nickname 키 사용
          // partnerId는 이미 있으므로 생략 가능하나 확실히 하기 위해 저장
          localStorage.setItem('partnerId', pInfo.partnerId);
      }
      
      const safeList = Array.isArray(pList) ? pList : [];
      setAccommodations(safeList);

      // 2. 현재 선택된 숙소 결정 로직
      if (safeList.length === 0) {
          setCurrentAccommodation(null);
          localStorage.removeItem('lastSelectedAccommodationId'); 
      } else {
          const savedId = localStorage.getItem('lastSelectedAccommodationId');
          const target = safeList.find(p => p.accommodationId === Number(savedId)) || safeList[0];
          setCurrentAccommodation(target);
          localStorage.setItem('lastSelectedAccommodationId', target.accommodationId);
      }

    } catch (error) {
      console.error("파트너 데이터 로딩 실패:", error);
      setAccommodations([]); 
      setCurrentAccommodation(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerData();
  }, []);

  const switchAccommodation = (accommodation) => {
    setCurrentAccommodation(accommodation);
    if (accommodation) {
        localStorage.setItem('lastSelectedAccommodationId', accommodation.accommodationId);
    }
  };

  return (
    <PartnerContext.Provider value={{ 
        accommodations,      
        currentAccommodation,
        switchAccommodation, 
        partnerInfo, // 이제 State가 아니라 위에서 정의한 Getter 객체가 넘어갑니다.
        isLoading,
        refreshPartnerData: loadPartnerData 
    }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);