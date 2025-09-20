export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  icon: string;
  description?: string;
}

export const EXERCISE_PRESETS: Exercise[] = [
  // 胸筋 - 大胸筋上部
  {
    id: 'incline_bench_press',
    name: 'インクラインベンチプレス',
    category: '胸筋',
    muscle_groups: ['大胸筋上部', '三角筋前部', '上腕三頭筋'],
    icon: '🏋️‍♂️',
    description: 'インクラインベンチで大胸筋上部を重点的に鍛える'
  },
  {
    id: 'incline_dumbbell_press',
    name: 'インクラインダンベルプレス',
    category: '胸筋',
    muscle_groups: ['大胸筋上部', '三角筋前部'],
    icon: '🏋️‍♀️',
    description: 'ダンベルを使った大胸筋上部のトレーニング'
  },
  {
    id: 'incline_dumbbell_fly',
    name: 'インクラインダンベルフライ',
    category: '胸筋',
    muscle_groups: ['大胸筋上部'],
    icon: '🦅',
    description: 'インクラインでのフライ動作で胸筋上部をストレッチ'
  },
  {
    id: 'incline_squeeze_press',
    name: 'インクラインスクイーズプレス',
    category: '胸筋',
    muscle_groups: ['大胸筋上部', '大胸筋内側'],
    icon: '🤲',
    description: 'ダンベルを合わせて行うプレス動作'
  },
  
  // 胸筋 - 大胸筋中部
  {
    id: 'bench_press',
    name: 'ベンチプレス',
    category: '胸筋',
    muscle_groups: ['大胸筋中部', '三角筋', '上腕三頭筋'],
    icon: '🏋️‍♂️',
    description: 'バーベルを使った基本的な胸筋トレーニング'
  },
  {
    id: 'dumbbell_press',
    name: 'ダンベルベンチプレス',
    category: '胸筋',
    muscle_groups: ['大胸筋中部', '三角筋'],
    icon: '🏋️‍♀️',
    description: 'ダンベルを使った胸筋トレーニング'
  },
  {
    id: 'dumbbell_fly',
    name: 'ダンベルフライ',
    category: '胸筋',
    muscle_groups: ['大胸筋中部'],
    icon: '🦅',
    description: 'ダンベルでのフライ動作で胸筋をストレッチ'
  },
  {
    id: 'push_up',
    name: 'プッシュアップ',
    category: '胸筋',
    muscle_groups: ['大胸筋中部', '三角筋', '上腕三頭筋'],
    icon: '💪',
    description: '自重を使った胸筋トレーニング'
  },
  
  // 胸筋 - 大胸筋下部
  {
    id: 'decline_bench_press',
    name: 'デクラインベンチプレス',
    category: '胸筋',
    muscle_groups: ['大胸筋下部', '上腕三頭筋'],
    icon: '🏋️‍♂️',
    description: 'デクラインベンチで大胸筋下部を重点的に鍛える'
  },
  {
    id: 'dips',
    name: 'ディップス',
    category: '胸筋',
    muscle_groups: ['大胸筋下部', '上腕三頭筋'],
    icon: '🤸‍♂️',
    description: '自重を使った大胸筋下部のトレーニング'
  },
  
  // 背筋 - 広背筋
  {
    id: 'chin_up',
    name: 'チンニング',
    category: '背筋',
    muscle_groups: ['広背筋', '上腕二頭筋', '僧帽筋'],
    icon: '🤸‍♂️',
    description: '自重を使った背筋の基本トレーニング'
  },
  {
    id: 'lat_pulldown',
    name: 'ラットプルダウン',
    category: '背筋',
    muscle_groups: ['広背筋', '上腕二頭筋'],
    icon: '⬇️',
    description: 'マシンを使った広背筋トレーニング'
  },
  {
    id: 't_bar_row',
    name: 'Tバーロウ',
    category: '背筋',
    muscle_groups: ['広背筋', '僧帽筋', '上腕二頭筋'],
    icon: '🏋️‍♂️',
    description: 'Tバーを使った背筋トレーニング'
  },
  {
    id: 'bent_over_row',
    name: 'ベントオーバーロウ',
    category: '背筋',
    muscle_groups: ['広背筋', '僧帽筋', '上腕二頭筋'],
    icon: '🏋️‍♀️',
    description: 'バーベルを使った背筋トレーニング'
  },
  {
    id: 'bent_over_row_under',
    name: 'ベントオーバーロウ（アンダー）',
    category: '背筋',
    muscle_groups: ['広背筋', '上腕二頭筋'],
    icon: '🏋️‍♂️',
    description: 'アンダーグリップでの背筋トレーニング'
  },
  {
    id: 'one_hand_row',
    name: 'ワンハンドロウ',
    category: '背筋',
    muscle_groups: ['広背筋', '僧帽筋'],
    icon: '💪',
    description: '片手でのダンベルロウ'
  },
  {
    id: 'double_row',
    name: 'ダブルロウ',
    category: '背筋',
    muscle_groups: ['広背筋', '僧帽筋'],
    icon: '🏋️‍♀️',
    description: '両手でのダンベルロウ'
  },
  {
    id: 'deadlift',
    name: 'デッドリフト',
    category: '背筋',
    muscle_groups: ['脊柱起立筋', 'ハムストリング', '臀筋'],
    icon: '🏋️‍♂️',
    description: 'バーベルを使った全身トレーニング'
  },
  
  // 背筋 - 僧帽筋
  {
    id: 'barbell_shrug',
    name: 'バーベルシュラッグ',
    category: '背筋',
    muscle_groups: ['僧帽筋'],
    icon: '🤷‍♂️',
    description: 'バーベルを使った僧帽筋トレーニング'
  },
  {
    id: 'dumbbell_shrug',
    name: 'ダンベルシュラッグ',
    category: '背筋',
    muscle_groups: ['僧帽筋'],
    icon: '🤷‍♀️',
    description: 'ダンベルを使った僧帽筋トレーニング'
  },
  {
    id: 't_bar_row_wide',
    name: 'Tバーロウ（ワイド）',
    category: '背筋',
    muscle_groups: ['僧帽筋', '広背筋'],
    icon: '🏋️‍♂️',
    description: 'ワイドグリップでのTバーロウ'
  },
  {
    id: 'bent_over_row_wide',
    name: 'ベントオーバーロウ（ワイド）',
    category: '背筋',
    muscle_groups: ['僧帽筋', '広背筋'],
    icon: '🏋️‍♀️',
    description: 'ワイドグリップでのベントオーバーロウ'
  },
  
  // 脚 - 大腿四頭筋
  {
    id: 'squat',
    name: 'スクワット',
    category: '脚',
    muscle_groups: ['大腿四頭筋', 'ハムストリング', '臀筋'],
    icon: '🦵',
    description: '下半身の基本トレーニング'
  },
  {
    id: 'front_squat',
    name: 'フロントスクワット',
    category: '脚',
    muscle_groups: ['大腿四頭筋', '体幹'],
    icon: '🏋️‍♂️',
    description: 'バーベルを前で持つスクワット'
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
    id: 'leg_extension',
    name: 'レッグエクステンション',
    category: '脚',
    muscle_groups: ['大腿四頭筋'],
    icon: '🦵',
    description: 'マシンを使った大腿四頭筋の単関節運動'
  },
  {
    id: 'lunges',
    name: 'ランジ',
    category: '脚',
    muscle_groups: ['大腿四頭筋', 'ハムストリング', '臀筋'],
    icon: '🦵',
    description: '片足ずつ行う脚トレーニング'
  },
  {
    id: 'bulgarian_split_squat',
    name: 'ブルガリアンスプリットスクワット',
    category: '脚',
    muscle_groups: ['大腿四頭筋', '臀筋'],
    icon: '🦵',
    description: '後ろ足を台に乗せたスクワット'
  },
  
  // 脚 - ハムストリング・臀筋
  {
    id: 'romanian_deadlift',
    name: 'ルーマニアンデッドリフト',
    category: '脚',
    muscle_groups: ['ハムストリング', '臀筋'],
    icon: '🏋️‍♂️',
    description: 'ハムストリングを重点的に鍛えるデッドリフト'
  },
  {
    id: 'leg_curl',
    name: 'レッグカール',
    category: '脚',
    muscle_groups: ['ハムストリング'],
    icon: '🦵',
    description: 'マシンを使ったハムストリングトレーニング'
  },
  {
    id: 'hip_thrust',
    name: 'ヒップスラスト',
    category: '脚',
    muscle_groups: ['臀筋', 'ハムストリング'],
    icon: '🍑',
    description: '臀筋を重点的に鍛えるトレーニング'
  },
  {
    id: 'good_morning',
    name: 'グッドモーニング',
    category: '脚',
    muscle_groups: ['ハムストリング', '脊柱起立筋'],
    icon: '🌅',
    description: 'バーベルを担いでのお辞儀動作'
  },
  
  // 脚 - ふくらはぎ
  {
    id: 'calf_raise',
    name: 'カーフレイズ',
    category: '脚',
    muscle_groups: ['腓腹筋', 'ヒラメ筋'],
    icon: '🦵',
    description: 'ふくらはぎのトレーニング'
  },
  {
    id: 'seated_calf_raise',
    name: 'シーテッドカーフレイズ',
    category: '脚',
    muscle_groups: ['ヒラメ筋'],
    icon: '🪑',
    description: '座った状態でのふくらはぎトレーニング'
  },
  
  // 肩 - 三角筋前部
  {
    id: 'overhead_press',
    name: 'オーバーヘッドプレス',
    category: '肩',
    muscle_groups: ['三角筋前部', '上腕三頭筋'],
    icon: '🏋️‍♀️',
    description: 'バーベルを頭上に押し上げるトレーニング'
  },
  {
    id: 'dumbbell_shoulder_press',
    name: 'ダンベルショルダープレス',
    category: '肩',
    muscle_groups: ['三角筋前部', '上腕三頭筋'],
    icon: '🏋️‍♂️',
    description: 'ダンベルを使ったショルダープレス'
  },
  {
    id: 'front_raise',
    name: 'フロントレイズ',
    category: '肩',
    muscle_groups: ['三角筋前部'],
    icon: '⬆️',
    description: 'ダンベルを前に上げる肩トレーニング'
  },
  
  // 肩 - 三角筋中部
  {
    id: 'lateral_raise',
    name: 'ラテラルレイズ',
    category: '肩',
    muscle_groups: ['三角筋中部'],
    icon: '↔️',
    description: 'ダンベルを横に上げる肩トレーニング'
  },
  {
    id: 'upright_row',
    name: 'アップライトロー',
    category: '肩',
    muscle_groups: ['三角筋中部', '僧帽筋'],
    icon: '🏋️‍♂️',
    description: 'バーベルを縦に引き上げるトレーニング'
  },
  
  // 肩 - 三角筋後部
  {
    id: 'rear_delt_fly',
    name: 'リアデルトフライ',
    category: '肩',
    muscle_groups: ['三角筋後部'],
    icon: '🦅',
    description: '三角筋後部を鍛えるフライ動作'
  },
  {
    id: 'face_pull',
    name: 'フェイスプル',
    category: '肩',
    muscle_groups: ['三角筋後部', '僧帽筋'],
    icon: '😤',
    description: 'ケーブルを顔に向かって引くトレーニング'
  },
  {
    id: 'reverse_fly',
    name: 'リバースフライ',
    category: '肩',
    muscle_groups: ['三角筋後部'],
    icon: '🔄',
    description: 'ダンベルでの逆フライ動作'
  },
  
  // 腕 - 上腕二頭筋
  {
    id: 'barbell_curl',
    name: 'バーベルカール',
    category: '腕',
    muscle_groups: ['上腕二頭筋'],
    icon: '💪',
    description: 'バーベルを使った上腕二頭筋トレーニング'
  },
  {
    id: 'dumbbell_curl',
    name: 'ダンベルカール',
    category: '腕',
    muscle_groups: ['上腕二頭筋'],
    icon: '💪',
    description: 'ダンベルを使った上腕二頭筋トレーニング'
  },
  {
    id: 'hammer_curl',
    name: 'ハンマーカール',
    category: '腕',
    muscle_groups: ['上腕二頭筋', '前腕'],
    icon: '🔨',
    description: 'ダンベルを縦に持って行うカール'
  },
  {
    id: 'preacher_curl',
    name: 'プリーチャーカール',
    category: '腕',
    muscle_groups: ['上腕二頭筋'],
    icon: '🙏',
    description: 'プリーチャーベンチを使ったカール'
  },
  {
    id: 'concentration_curl',
    name: 'コンセントレーションカール',
    category: '腕',
    muscle_groups: ['上腕二頭筋'],
    icon: '🎯',
    description: '座って行う集中的なカール'
  },
  
  // 腕 - 上腕三頭筋
  {
    id: 'close_grip_bench_press',
    name: 'クローズグリップベンチプレス',
    category: '腕',
    muscle_groups: ['上腕三頭筋', '大胸筋'],
    icon: '🏋️‍♂️',
    description: 'ナローグリップでのベンチプレス'
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
    id: 'overhead_tricep_extension',
    name: 'オーバーヘッドトライセップエクステンション',
    category: '腕',
    muscle_groups: ['上腕三頭筋'],
    icon: '⬆️',
    description: '頭上でのトライセップエクステンション'
  },
  {
    id: 'tricep_pushdown',
    name: 'トライセッププッシュダウン',
    category: '腕',
    muscle_groups: ['上腕三頭筋'],
    icon: '⬇️',
    description: 'ケーブルを使った上腕三頭筋トレーニング'
  },
  {
    id: 'diamond_push_up',
    name: 'ダイヤモンドプッシュアップ',
    category: '腕',
    muscle_groups: ['上腕三頭筋', '大胸筋'],
    icon: '💎',
    description: '手をダイヤモンド型にしたプッシュアップ'
  },
  
  // 腹筋 - 腹直筋
  {
    id: 'crunches',
    name: 'クランチ',
    category: '腹筋',
    muscle_groups: ['腹直筋'],
    icon: '🤸‍♀️',
    description: '腹筋の基本トレーニング'
  },
  {
    id: 'sit_up',
    name: 'シットアップ',
    category: '腹筋',
    muscle_groups: ['腹直筋', '腸腰筋'],
    icon: '⬆️',
    description: '上体を完全に起こす腹筋運動'
  },
  {
    id: 'bicycle_crunch',
    name: 'バイシクルクランチ',
    category: '腹筋',
    muscle_groups: ['腹直筋', '腹斜筋'],
    icon: '🚴‍♂️',
    description: '自転車を漕ぐような動作のクランチ'
  },
  {
    id: 'leg_raise',
    name: 'レッグレイズ',
    category: '腹筋',
    muscle_groups: ['腹直筋下部'],
    icon: '🦵',
    description: '脚を上げる腹筋下部のトレーニング'
  },
  {
    id: 'hanging_leg_raise',
    name: 'ハンギングレッグレイズ',
    category: '腹筋',
    muscle_groups: ['腹直筋', '前腕'],
    icon: '🤸‍♂️',
    description: 'ぶら下がって行うレッグレイズ'
  },
  
  // 腹筋 - 腹斜筋
  {
    id: 'russian_twist',
    name: 'ロシアンツイスト',
    category: '腹筋',
    muscle_groups: ['腹斜筋', '腹直筋'],
    icon: '🌪️',
    description: '腹斜筋を鍛えるツイスト動作'
  },
  {
    id: 'side_plank',
    name: 'サイドプランク',
    category: '腹筋',
    muscle_groups: ['腹斜筋', '体幹'],
    icon: '📐',
    description: '横向きでのプランク'
  },
  {
    id: 'wood_chop',
    name: 'ウッドチョップ',
    category: '腹筋',
    muscle_groups: ['腹斜筋', '体幹'],
    icon: '🪓',
    description: '斧を振るような動作のトレーニング'
  },
  
  // 腹筋 - 体幹
  {
    id: 'plank',
    name: 'プランク',
    category: '腹筋',
    muscle_groups: ['体幹', '腹直筋'],
    icon: '🧘‍♂️',
    description: '体幹を鍛える基本トレーニング'
  },
  {
    id: 'dead_bug',
    name: 'デッドバグ',
    category: '腹筋',
    muscle_groups: ['体幹', '腹直筋'],
    icon: '🪲',
    description: '仰向けでの体幹安定性トレーニング'
  },
  {
    id: 'bird_dog',
    name: 'バードドッグ',
    category: '腹筋',
    muscle_groups: ['体幹', '脊柱起立筋'],
    icon: '🐕',
    description: '四つん這いでの体幹トレーニング'
  },
  {
    id: 'mountain_climber',
    name: 'マウンテンクライマー',
    category: '腹筋',
    muscle_groups: ['体幹', '腹直筋', '有酸素'],
    icon: '🏔️',
    description: '山登りのような動作の全身運動'
  },
  
  // 有酸素トレーニング
  {
    id: 'running',
    name: 'ランニング',
    category: '有酸素',
    muscle_groups: ['全身', '心肺機能'],
    icon: '🏃‍♂️',
    description: '屋外または室内でのランニング'
  },
  {
    id: 'treadmill',
    name: 'トレッドミル',
    category: '有酸素',
    muscle_groups: ['全身', '心肺機能'],
    icon: '🏃‍♀️',
    description: 'トレッドミルでのランニング'
  },
  {
    id: 'cycling',
    name: 'サイクリング',
    category: '有酸素',
    muscle_groups: ['下半身', '心肺機能'],
    icon: '🚴‍♂️',
    description: '屋外または室内でのサイクリング'
  },
  {
    id: 'stationary_bike',
    name: 'エアロバイク',
    category: '有酸素',
    muscle_groups: ['下半身', '心肺機能'],
    icon: '🚴‍♀️',
    description: 'エアロバイクでの有酸素運動'
  },
  {
    id: 'elliptical',
    name: 'エリプティカル',
    category: '有酸素',
    muscle_groups: ['全身', '心肺機能'],
    icon: '🏃‍♂️',
    description: 'エリプティカルマシンでの有酸素運動'
  },
  {
    id: 'rowing',
    name: 'ローイング',
    category: '有酸素',
    muscle_groups: ['全身', '心肺機能'],
    icon: '🚣‍♂️',
    description: 'ローイングマシンでの全身有酸素運動'
  },
  {
    id: 'swimming',
    name: '水泳',
    category: '有酸素',
    muscle_groups: ['全身', '心肺機能'],
    icon: '🏊‍♂️',
    description: 'プールでの水泳'
  },
  {
    id: 'walking',
    name: 'ウォーキング',
    category: '有酸素',
    muscle_groups: ['下半身', '心肺機能'],
    icon: '🚶‍♂️',
    description: '屋外または室内でのウォーキング'
  },
  {
    id: 'hiit',
    name: 'HIIT',
    category: '有酸素',
    muscle_groups: ['全身', '心肺機能'],
    icon: '⚡',
    description: '高強度インターバルトレーニング'
  },
  {
    id: 'jump_rope',
    name: '縄跳び',
    category: '有酸素',
    muscle_groups: ['全身', '心肺機能'],
    icon: '🪢',
    description: '縄跳びでの有酸素運動'
  },
  {
    id: 'burpees',
    name: 'バーピー',
    category: '有酸素',
    muscle_groups: ['全身', '心肺機能'],
    icon: '🤸‍♂️',
    description: '全身を使った高強度運動'
  },
  {
    id: 'step_ups',
    name: 'ステップアップ',
    category: '有酸素',
    muscle_groups: ['下半身', '心肺機能'],
    icon: '📶',
    description: '台を使った昇降運動'
  }
];

export const EXERCISE_CATEGORIES = [
  '胸筋',
  '背筋',
  '脚',
  '肩',
  '腕',
  '腹筋',
  '有酸素'
];

export function getExercisesByCategory(category: string): Exercise[] {
  return EXERCISE_PRESETS.filter(exercise => exercise.category === category);
}

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_PRESETS.find(exercise => exercise.id === id);
}