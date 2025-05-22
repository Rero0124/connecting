import fs from 'fs'
import path from 'path'

const apiRoot = path.resolve('app/api')
const outputRoot = path.resolve('src/lib/openapi/routes')

function walk(dir: string): string[] {
	let results: string[] = []
	const list = fs.readdirSync(dir)
	for (const file of list) {
		const fullPath = path.join(dir, file)
		const stat = fs.statSync(fullPath)
		if (stat && stat.isDirectory()) {
			results = results.concat(walk(fullPath))
		} else if (file === 'route.ts') {
			results.push(fullPath)
		}
	}
	return results
}

const routes = walk(apiRoot)

for (const routeFile of routes) {
	const relative = path.relative(apiRoot, path.dirname(routeFile))
	const targetDir = path.join(outputRoot, relative)
	const targetFile = path.join(targetDir, 'index.ts')
	const targetFile2 = path.join(targetDir, 'path.ts')

	if (!fs.existsSync(targetFile)) {
		fs.mkdirSync(targetDir, { recursive: true })
		fs.writeFileSync(
			targetFile,
			`// auto-generated openapi route file for /${relative}\n`
		)
		console.log(`✅ Created: ${targetFile}`)
	} else {
		console.log(`⚠️ Skipped (already exists): ${targetFile}`)
	}
	if (!fs.existsSync(targetFile2)) {
		fs.mkdirSync(targetDir, { recursive: true })
		fs.writeFileSync(
			targetFile2,
			`// auto-generated openapi route file for /${relative}\n`
		)
		console.log(`✅ Created: ${targetFile2}`)
	} else {
		console.log(`⚠️ Skipped (already exists): ${targetFile2}`)
	}
	console.log(`✅ ${targetFile}`)
}
