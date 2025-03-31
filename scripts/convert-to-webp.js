
import pkg from 'glob';
const { glob } = pkg;
import fs from 'fs';
import path from 'path';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
// 匹配所有 PNG 和 JPG
glob('public/imgs/**/*.{png,jpg,jpeg}', async (err, files) => {
    if (err) throw err;

    let count = 0;

    for (const file of files) {
        const dir = path.dirname(file);
        const ext = path.extname(file);
        const base = path.basename(file, ext);
        const outputPath = path.join(dir, `${base}.webp`);

        // 读取原图像并压缩为 WebP
        const data = await imagemin([file], {
            plugins: [imageminWebp({ quality: 75 })],
        });

        if (data.length > 0) {
            fs.writeFileSync(outputPath, data[0].data);
            count++;
        }
    }

    console.log(`✅ 已生成 ${count} 个 WebP 文件`);
});
