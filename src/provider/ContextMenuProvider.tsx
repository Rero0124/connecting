'use client'

import { useEffect, useState } from 'react'

export interface ContextMenuData {
	name: string
	callback: () => void
}

const contextMenuDataMap = new WeakMap<HTMLElement, ContextMenuData[]>()

export const setContextMenu = (
	element: HTMLElement,
	data: ContextMenuData[]
) => {
	contextMenuDataMap.set(element, data)
}

export default function ContextMenuProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [isOpen, setIsOpen] = useState(false)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [contexts, setContexts] = useState<ContextMenuData[]>([])

	const findContextData = (target: EventTarget | null): ContextMenuData[] => {
		if (!target || !(target instanceof HTMLElement)) return []
		const contextMenuData = contextMenuDataMap.get(target)
		if (contextMenuData) {
			return contextMenuData
		} else {
			return findContextData(target.parentElement)
		}
	}

	const handleCloseContextMenu = () => setIsOpen(false)

	useEffect(() => {
		const handleContextMenu = (e: MouseEvent) => {
			const target = e.target
			const found = findContextData(target) // 위에서 만든 트리 탐색 함수
			if (!found.length) return

			e.preventDefault()
			setContexts(found)
			setPosition({ x: e.clientX, y: e.clientY })
			setIsOpen(true)
		}

		document.addEventListener('contextmenu', handleContextMenu)
		document.addEventListener('click', handleCloseContextMenu)
		return () => {
			document.removeEventListener('contextmenu', handleContextMenu)
			document.removeEventListener('click', handleCloseContextMenu)
		}
	}, [])

	return (
		<>
			{children}
			{isOpen && (
				<div
					className="absolute z-50 bg-background border rounded shadow-lg"
					style={{ left: position.x, top: position.y }}
					onMouseLeave={() => setIsOpen(false)}
				>
					<ul>
						{contexts.map((context, idx) => (
							<li
								key={`${idx}_${context.name}`}
								className="p-2 bg-background-light"
								onClick={() => {
									context.callback()
								}}
							>
								{context.name}
							</li>
						))}
					</ul>
				</div>
			)}
		</>
	)
}
