import { createContext, useContext, useState, useEffect } from 'react';
import { getAccommodationsByPartnerId } from '../api/accommodationAPI'; 
import { getPartner } from '../api/partnerAPI'; 

const PartnerContext = createContext();

export const PartnerProvider = ({ children }) => {
  const [accommodations, setAccommodations] = useState([]); 
  const [currentAccommodation, setCurrentAccommodation] = useState(null); 
  const [partnerInfo, setPartnerInfo] = useState({ 
      partnerId: null, 
      bizName: '', 
      ceoName: '' 
  });
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드 함수
  const loadPartnerData = async () => {
    const storedPartnerId =  1; //localStorage.getItem('partnerId') ||

    try {
      setIsLoading(true);

      // 1. 파트너 정보와 숙소 목록을 병렬로 조회
      const [pInfo, pList] = await Promise.all([
          getPartner(storedPartnerId),
          getAccommodationsByPartnerId(storedPartnerId)
      ]);

      setPartnerInfo(pInfo);
      
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
        partnerInfo,
        isLoading,
        refreshPartnerData: loadPartnerData 
    }}>
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);