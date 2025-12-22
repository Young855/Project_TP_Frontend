import { useState, useMemo } from "react";
import { getPriceValue } from "../utils/accommodationUtils";
import { MIN_PRICE, MAX_PRICE } from "../constants/SearchOption";

export function useAccommodationFilter(originalResults = []) {
  const [excludeSoldOut, setExcludeSoldOut] = useState(false);
  const [selectedType, setSelectedType] = useState("ALL");
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [selectedCommonFacilities, setSelectedCommonFacilities] = useState(new Set());
  const [selectedRoomFacilities, setSelectedRoomFacilities] = useState(new Set());
  const [sortOption, setSortOption] = useState("RECOMMENDED");

  // Set 토글 함수
  const toggleInSet = (setFn, value) => {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const resetFilters = () => {
    setExcludeSoldOut(false);
    setSelectedType("ALL");
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
    setSelectedTags(new Set());
    setSelectedCommonFacilities(new Set());
    setSelectedRoomFacilities(new Set());
  };

  const displayResults = useMemo(() => {
    let list = originalResults.filter((p) => {

        const uniqueMap = new Map();
    originalResults.forEach((item) => {
      // accommodationId가 없거나 중복이면 덮어쓰거나 무시
      if (item.accommodationId) {
         uniqueMap.set(item.accommodationId, item);
      }
    });
    // 중복이 제거된 깔끔한 리스트
    const uniqueList = Array.from(uniqueMap.values());
      if (excludeSoldOut && p.isSoldOut === true) return false;

      if (selectedType !== "ALL") {
        if ((p.accommodationType || "").toUpperCase() !== selectedType) {
          return false;
        }
      }

      const price = getPriceValue(p);
      if (price != null) {
        if (price < minPrice || price > maxPrice) return false;
      }

      if (selectedTags.size > 0) {
        const tags = p.tags || p.hashtags || [];
        const tagNames = tags.map((t) =>
          typeof t === "string" ? t : t.name || t.label || ""
        );
        for (const need of selectedTags) {
          if (!tagNames.includes(need)) return false;
        }
      }

      const amenities = Array.isArray(p.amenities)
        ? p.amenities.map((a) =>
            typeof a === "string" ? a : a.name || a.amenityName || ""
          )
        : [];

      if (selectedCommonFacilities.size > 0) {
        for (const need of selectedCommonFacilities) {
          if (!amenities.includes(need)) return false;
        }
      }
      if (selectedRoomFacilities.size > 0) {
        for (const need of selectedRoomFacilities) {
          if (!amenities.includes(need)) return false;
        }
      }

      return true;
    });

    switch (sortOption) {
      case "RATING_DESC":
        list = [...list].sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));
        break;
      case "REVIEW_DESC": {
        const getReview = (x) => x.reviewCount ?? x.reviewCnt ?? x.reviewTotal ?? 0;
        list = [...list].sort((a, b) => getReview(b) - getReview(a));
        break;
      }
      case "PRICE_ASC":
        list = [...list].sort((a, b) => {
          const pa = getPriceValue(a);
          const pb = getPriceValue(b);
          const va = pa == null ? Number.POSITIVE_INFINITY : pa;
          const vb = pb == null ? Number.POSITIVE_INFINITY : pb;
          return va - vb;
        });
        break;
      case "PRICE_DESC":
        list = [...list].sort((a, b) => {
          const pa = getPriceValue(a);
          const pb = getPriceValue(b);
          const va = pa == null ? Number.NEGATIVE_INFINITY : pa;
          const vb = pb == null ? Number.NEGATIVE_INFINITY : pb;
          return vb - va;
        });
        break;
      case "RECOMMENDED":
      default:
        break;
    }

    return list;
  }, [
    originalResults,
    excludeSoldOut,
    selectedType,
    minPrice,
    maxPrice,
    selectedTags,
    selectedCommonFacilities,
    selectedRoomFacilities,
    sortOption,
  ]);

  return {
    // States
    excludeSoldOut, setExcludeSoldOut,
    selectedType, setSelectedType,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    selectedTags, setSelectedTags,
    selectedCommonFacilities, setSelectedCommonFacilities,
    selectedRoomFacilities, setSelectedRoomFacilities,
    sortOption, setSortOption,
    
    // Actions & Results
    toggleInSet,
    resetFilters,
    displayResults
  };
}