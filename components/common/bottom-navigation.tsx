"use client"

import { Home, BarChart3, User } from "lucide-react"

interface BottomNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "home", label: "홈", icon: Home },
    { id: "analysis", label: "분석", icon: BarChart3 },
    { id: "profile", label: "프로필", icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200/50 px-4 py-2 sm:py-3 safe-area-pb shadow-2xl">
      <div className="flex justify-around items-center max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 sm:py-3 px-3 sm:px-4 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
              activeTab === id
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
            <span className="text-xs font-bold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
