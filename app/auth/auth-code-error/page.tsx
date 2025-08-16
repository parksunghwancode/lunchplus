export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">인증 링크 오류</h1>
            <p className="text-gray-600">이메일 인증 링크가 만료되었거나 잘못되었습니다.</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">새로운 인증 이메일을 받으려면 다시 회원가입을 시도해주세요.</p>

            <div className="space-y-3">
              <a
                href="/auth/signup"
                className="w-full inline-flex justify-center items-center px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                다시 회원가입하기
              </a>

              <a
                href="/"
                className="w-full inline-flex justify-center items-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                홈으로 돌아가기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
