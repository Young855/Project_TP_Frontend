import { useState, useEffect } from "react";
import { calculateTotalPrices } from "../api/accommodationPriceAPI";

/**
 * 숙소 리스트와 날짜를 받아 가격을 계산하고 Map 형태로 반환하는 Hook
 * @param {Array} accommodations - 숙소 객체 리스트 (displayResults)
 * @param {string} checkIn - 체크인 날짜
 * @param {string} checkOut - 체크아웃 날짜
 * @returns {object} priceMap - { 숙소ID: 가격 } 형태의 맵
 */
export const useAccommodationPrices = (accommodations, checkIn, checkOut) => {
  const [priceMap, setPriceMap] = useState({});

  useEffect(() => {
    // 1. 필수 조건 검사
    if (!checkIn || !checkOut || !accommodations || accommodations.length === 0) {
      return;
    }

    // 2. 이미 계산된 ID는 제외 (API 호출 최소화)
    const idsToCalculate = accommodations
      .map((acc) => Number(acc.accommodationId))
      .filter((id) => priceMap[id] === undefined);

    if (idsToCalculate.length === 0) return;

    // 3. API 호출
    calculateTotalPrices(idsToCalculate, checkIn, checkOut)
      .then((priceList) => {
        setPriceMap((prev) => {
          const newMap = { ...prev };
          priceList.forEach((item) => {
            if (item.available) {
              newMap[item.accommodationId] = item.totalPrice;
            } else {
              newMap[item.accommodationId] = 0; // 0 = 예약 불가
            }
          });
          return newMap;
        });
      })
      .catch((err) => console.error("가격 계산 실패:", err));
      
  }, [accommodations, checkIn, checkOut]); // 의존성 배열

  return priceMap;
};