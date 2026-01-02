const fs = require('fs');
const path = require('path');

const enemiesPath = path.join(__dirname, '../data/enemies.ts');
let content = fs.readFileSync(enemiesPath, 'utf-8');

// 高レベルセクションマーカー（これ以降は「何もしない」を付けない）
const highLevelMarkers = [
  '火山クレーター (Lv60-120)',
  '凍てつく凍土 (Lv120-200)',
  '呪われた大聖堂 (Lv200-350)',
  '深淵の奈落 (Lv350-550)',
  '竜の巣 (Lv550-800)',
  '虚無の核心 (Lv800-1000)'
];

// 行ごとに処理
const lines = content.split('\n');
let inHighLevelSection = false;
let output = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // セクション判定
  for (const marker of highLevelMarkers) {
    if (line.includes(marker)) {
      inHighLevelSection = true;
    }
  }
  
  // actionPoolがある場合、セクションチェック
  if (line.includes('actionPool: [')) {
    output.push(line);
    // actionPool内の行を処理
    let j = i + 1;
    while (j < lines.length && !lines[j].includes(']')) {
      const poolLine = lines[j];
      
      // 高レベルセクションかつ「何もしない」行なら削除
      if (inHighLevelSection && poolLine.includes('type: \'nothing\'')) {
        j++;
        continue; // スキップ
      }
      
      output.push(poolLine);
      j++;
    }
    
    if (j < lines.length) {
      output.push(lines[j]); // 閉じ括弧
    }
    i = j;
    continue;
  }
  
  output.push(line);
}

const result = output.join('\n');
fs.writeFileSync(enemiesPath, result, 'utf-8');
console.log('✓ Removed "nothing" action from high-level enemies');

