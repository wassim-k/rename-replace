import fs from 'fs-extra';
import path from 'path';

export async function renameFolder(src: string, dest: string): Promise<void> {
    if (await fs.exists(dest)) {
        await moveChildren(src, dest);
        await fs.rmdir(src);
    } else {
        await fs.rename(src, dest);
    }
}

async function moveChildren(src: string, dest: string): Promise<void> {
    const children = await fs.readdir(src, { withFileTypes: true });

    for (const child of children) {
        const srcChild = path.join(src, child.name);
        const destChild = path.join(dest, child.name);

        if (child.isDirectory()) {
            await renameFolder(srcChild, destChild);
        } else {
            await fs.rename(srcChild, destChild);
        }
    }
}
