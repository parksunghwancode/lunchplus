"use client"

import { AlertTriangle } from "lucide-react"

interface ResetDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ResetDialog({ isOpen, onClose, onConfirm }: ResetDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scale-up">
        <div className="text-center">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">프로필을 재설정하시겠습니까?</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            모든 개인 정보와 설정이 삭제되며, 처음 설정 화면으로 돌아갑니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-bold transition-all duration-200"
            >
              취소
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
            >
              재설정
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
