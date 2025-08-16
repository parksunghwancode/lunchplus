-- 사용자 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  school_name TEXT,
  school_code TEXT,
  office_code TEXT,
  age_group TEXT DEFAULT 'middle_school',
  allergies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 급식 평점 테이블
CREATE TABLE meal_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  school_code TEXT NOT NULL,
  meal_date DATE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, school_code, meal_date)
);

-- 영양 분석 히스토리
CREATE TABLE nutrition_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL,
  nutrition_data JSONB NOT NULL,
  health_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, meal_date)
);

-- 퀴즈 진행 상황
CREATE TABLE quiz_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_date DATE NOT NULL,
  question_id INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quiz_date)
);

-- Row Level Security 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_progress ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can view own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can view own meal ratings" ON meal_ratings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own nutrition history" ON nutrition_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own quiz progress" ON quiz_progress FOR ALL USING (auth.uid() = user_id);

-- 급식 평점은 모든 사용자가 조회 가능 (랭킹, 평균 평점 등을 위해)
CREATE POLICY "Anyone can view meal ratings" ON meal_ratings FOR SELECT USING (true);
