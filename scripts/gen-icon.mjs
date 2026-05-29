// icon.svg → PNG 변환 스크립트
// SVG 수정 후 `node scripts/gen-icon.mjs` 실행하면 PNG 갱신됩니다

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')
const svgPath = path.join(publicDir, 'icon.svg')
const svg = fs.readFileSync(svgPath)

const sizes = [16, 32, 64, 128, 256, 512, 1024]

for (const size of sizes) {
  await sharp(svg).resize(size, size).png().toFile(path.join(publicDir, `icon-${size}.png`))
  console.log(`✓ icon-${size}.png`)
}

await sharp(svg).resize(512, 512).png().toFile(path.join(publicDir, 'icon.png'))
console.log('✓ icon.png (512×512, main)')
console.log('\n🎉 아이콘 생성 완료! (SVG 수정 후 이 스크립트를 다시 실행하세요)')
