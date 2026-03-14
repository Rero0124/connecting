'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export interface ContextMenuItem {
	label: string
	onClick: () => void
	danger?: boolean
}

export type ContextMenuSeparator = { separator: true }

export type ContextMenuEntry = ContextMenuItem | ContextMenuSeparator

function isSeparator(entry: ContextMenuEntry): entry is ContextMenuSeparator {
	return 'separator' in entry
}

interface ContextMenuState {
	open: (e: React.MouseEvent, items: ContextMenuEntry[]) => void
}

const ContextMenuContext = createContext<ContextMenuState>({
	open: () => {},
})

export const useContextMenu = () => useContext(ContextMenuContext)

// Legacy WeakMap support
const contextMenuDataMap = new WeakMap<HTMLElement, ContextMenuEntry[]>()

export const setContextMenu = (
	element: HTMLElement,
	data: { name: string; callback: () => void }[]
) => {
	contextMenuDataMap.set(
		element,
		data.map((d) => ({ label: d.name, onClick: d.callback }))
	)
}

export default function ContextMenuProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const [isOpen, setIsOpen] = useState(false)
	const [position, setPosition] = useState({ x: 0, y: 0 })
	const [items, setItems] = useState<ContextMenuEntry[]>([])
	const menuRef = useRef<HTMLDivElement>(null)

	const findLegacyContextData = (target: EventTarget | null): ContextMenuEntry[] => {
		if (!target || !(target instanceof HTMLElement)) return []
		const data = contextMenuDataMap.get(target)
		if (data) return data
		return findLegacyContextData(target.parentElement)
	}

	const clampPosition = useCallback((x: number, y: number) => {
		const menuWidth = 200
		const menuHeight = 300
		const clampedX = Math.min(x, window.innerWidth - menuWidth)
		const clampedY = Math.min(y, window.innerHeight - menuHeight)
		return { x: Math.max(0, clampedX), y: Math.max(0, clampedY) }
	}, [])

	const openMenu = useCallback(
		(e: React.MouseEvent, menuItems: ContextMenuEntry[]) => {
			e.preventDefault()
			e.stopPropagation()
			const pos = clampPosition(e.clientX, e.clientY)
			setItems(menuItems)
			setPosition(pos)
			setIsOpen(true)
		},
		[clampPosition]
	)

	const closeMenu = useCallback(() => setIsOpen(false), [])

	useEffect(() => {
		const handleNativeContextMenu = (e: MouseEvent) => {
			const found = findLegacyContextData(e.target)
			if (!found.length) return
			e.preventDefault()
			const pos = clampPosition(e.clientX, e.clientY)
			setItems(found)
			setPosition(pos)
			setIsOpen(true)
		}

		const handleClick = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setIsOpen(false)
			}
		}

		const handleScroll = () => setIsOpen(false)
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setIsOpen(false)
		}

		document.addEventListener('contextmenu', handleNativeContextMenu)
		document.addEventListener('mousedown', handleClick)
		document.addEventListener('scroll', handleScroll, true)
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('contextmenu', handleNativeContextMenu)
			document.removeEventListener('mousedown', handleClick)
			document.removeEventListener('scroll', handleScroll, true)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [clampPosition])

	return (
		<ContextMenuContext.Provider value={{ open: openMenu }}>
			{children}
			{isOpen && (
				<div
					ref={menuRef}
					className="fixed z-100 min-w-45 py-1.5 bg-background-secondary border border-border-light rounded-xl shadow-lg overflow-hidden animate-slide-in"
					style={{ left: position.x, top: position.y }}
				>
					{items.map((item, idx) =>
						isSeparator(item) ? (
							<div
								key={`sep_${idx}`}
								className="my-1 mx-2 h-px bg-border-light"
							/>
						) : (
							<button
								key={`${idx}_${item.label}`}
								className={`w-full text-left px-3 py-2 text-sm transition-colors ${
									item.danger
										? 'text-danger hover:bg-danger/10'
										: 'text-foreground-muted hover:bg-background-light hover:text-foreground'
								}`}
								onClick={() => {
									item.onClick()
									closeMenu()
								}}
							>
								{item.label}
							</button>
						)
					)}
				</div>
			)}
		</ContextMenuContext.Provider>
	)
}
