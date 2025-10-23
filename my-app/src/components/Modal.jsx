import React from 'react';
import { X } from 'lucide-react';

/**
 * 재사용 가능한 모달 컴포넌트
 * @param {object} props
 * @param {boolean} props.isOpen - 모달 열림 여부
 * @param {function} props.onClose - 닫기 함수
 * @param {string} props.title - 모달 제목
 * @param {React.ReactNode} props.children - 모달 내용
 * @param {string} [props.confirmText] - 확인 버튼 텍스트
 * @param {function} [props.onConfirm] - 확인 버튼 클릭 함수
 */
const Modal = ({ isOpen, onClose, title, children, confirmText, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6 relative animate-modal-slide-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-gray-700 mb-6">{children}</div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
           취소
          </button>
          {onConfirm && confirmText && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;