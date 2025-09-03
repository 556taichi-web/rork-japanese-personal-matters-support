export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  icon: string;
  description?: string;
}

export const EXERCISE_PRESETS: Exercise[] = [
  // 胸筋
  {
    id: 'bench_press',
    name: 'ベンチプレス',
    category: '胸筋',
    muscle_groups: ['胸筋', '三角筋', '上腕三頭筋'],
    icon: '🏋️‍♂️',
    description: 'バーベルを使った基本的な胸筋トレーニング'
  },
  {
    id: 'push_up',
    name: 'プッシュアップ',
    category: '胸筋',
    muscle_groups: ['胸筋', '三角筋', '上腕三頭筋'],
    icon: '💪',
    description: '自重を使った胸筋トレーニング'
  },
  {
    id: 'dumbbell_press',
    name: 'ダンベルプレス',
    category: '胸筋',
    muscle_groups: ['胸筋', '三角筋'],
    icon: '🏋️‍♀️',
    description: 'ダンベルを使った胸筋トレーニング'
  },
  
  // 背筋
  {
    id: 'deadlift',
    name: 'デッドリフト',
    category: '背筋',
    muscle_groups: ['背筋', 'ハムストリング', '臀筋'],
    icon: '🏋️‍♂️',
    description: 'バーベルを使った全身トレーニング'
  },
  {
    id: 'pull_up',
    name: 'プルアップ',
    category: '背筋',
    muscle_groups: ['広背筋', '上腕二頭筋'],
    icon: '🤸‍♂️',
    description: '自重を使った背筋トレーニング'
  },
  {
    id: 'bent_over_row',
    name: 'ベントオーバーロー',
    category: '背筋',
    muscle_groups: ['広背筋', '僧帽筋', '上腕二頭筋'],
    icon: '🏋️‍♀️',
    description: 'バーベルを使った背筋トレーニング'
  },
  
  // 脚
  {
    id: 'squat',
    name: 'スクワット',
    category: '脚',
    muscle_groups: ['大腿四頭筋', 'ハムストリング', '臀筋'],
    icon: '🦵',
    description: '下半身の基本トレーニング'
  },
  {
    id: 'leg_press',
    name: 'レッグプレス',
    category: '脚',
    muscle_groups: ['大腿四頭筋', 'ハムストリング', '臀筋'],
    icon: '🏋️‍♂️',
    description: 'マシンを使った脚トレーニング'
  },
  {
    id: 'lunges',
    name: 'ランジ',
    category: '脚',
    muscle_groups: ['大腿四頭筋', 'ハムストリング', '臀筋'],
    icon: '🦵',
    description: '片足ずつ行う脚トレーニング'
  },
  
  // 肩
  {
    id: 'overhead_press',
    name: 'オーバーヘッドプレス',
    category: '肩',
    muscle_groups: ['三角筋', '上腕三頭筋'],
    icon: '🏋️‍♀️',
    description: 'バーベルを頭上に押し上げるトレーニング'
  },
  {
    id: 'lateral_raise',
    name: 'ラテラルレイズ',
    category: '肩',
    muscle_groups: ['三角筋'],
    icon: '💪',
    description: 'ダンベルを横に上げる肩トレーニング'
  },
  {
    id: 'upright_row',
    name: 'アップライトロー',
    category: '肩',
    muscle_groups: ['三角筋', '僧帽筋'],
    icon: '🏋️‍♂️',
    description: 'バーベルを縦に引き上げるトレーニング'
  },
  
  // 腕
  {
    id: 'bicep_curl',
    name: 'バイセップカール',
    category: '腕',
    muscle_groups: ['上腕二頭筋'],
    icon: '💪',
    description: 'ダンベルを使った上腕二頭筋トレーニング'
  },
  {
    id: 'tricep_dip',
    name: 'トライセップディップ',
    category: '腕',
    muscle_groups: ['上腕三頭筋'],
    icon: '🤸‍♂️',
    description: '自重を使った上腕三頭筋トレーニング'
  },
  {
    id: 'hammer_curl',
    name: 'ハンマーカール',
    category: '腕',
    muscle_groups: ['上腕二頭筋', '前腕'],
    icon: '💪',
    description: 'ダンベルを縦に持って行うカール'
  },
  
  // 腹筋
  {
    id: 'plank',
    name: 'プランク',
    category: '腹筋',
    muscle_groups: ['腹筋', '体幹'],
    icon: '🧘‍♂️',
    description: '体幹を鍛える基本トレーニング'
  },
  {
    id: 'crunches',
    name: 'クランチ',
    category: '腹筋',
    muscle_groups: ['腹筋'],
    icon: '🤸‍♀️',
    description: '腹筋の基本トレーニング'
  },
  {
    id: 'russian_twist',
    name: 'ロシアンツイスト',
    category: '腹筋',
    muscle_groups: ['腹筋', '腹斜筋'],
    icon: '🌪️',
    description: '腹斜筋を鍛えるトレーニング'
  }
];

export const EXERCISE_CATEGORIES = [
  '胸筋',
  '背筋',
  '脚',
  '肩',
  '腕',
  '腹筋'
];

export function getExercisesByCategory(category: string): Exercise[] {
  return EXERCISE_PRESETS.filter(exercise => exercise.category === category);
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_PRESETS.find(exercise => exercise.id === id);
}