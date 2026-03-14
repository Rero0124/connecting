import { mergeRefs } from '@/src/lib/util'
import { useEffect, useRef } from 'react'

export interface DragAbleDivOption {
	direction:
		| Array<'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'>
		| 'top'
		| 'bottom'
		| 'left'
		| 'right'
		| 'start'
		| 'end'
	hoverSize?: number
	minWidth?: number
	maxWidth?: number
	minHeight?: number
	maxHeight?: number
	onDraggingInterval?: number
	hoverColor?: string
}

export default function DragAbleDiv({
	ref,
	children,
	option,
	classname = '',
	style,
	onDragging,
	onDragEnd,
}: {
	ref?: React.RefObject<HTMLDivElement | null>
	children: React.ReactNode
	option: {
		direction:
			| Array<'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'>
			| 'top'
			| 'bottom'
			| 'left'
			| 'right'
			| 'start'
			| 'end'
		hoverSize?: number
		minWidth?: number
		maxWidth?: number
		minHeight?: number
		maxHeight?: number
		onDraggingInterval?: number
		hoverColor?: string
	}
	classname?: string
	style?: React.CSSProperties
	onDragging?: (movedPx: { x: number; y: number }) => void
	onDragEnd?: (movedPx: { x: number; y: number }) => void
}) {
	const currentRef = useRef<HTMLDivElement>(null)
	const childRef = useRef<HTMLDivElement>(null)

	const prevPos = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	}

	const movedPx = {
		x: 0,
		y: 0,
	}

	useEffect(() => {
		const current = currentRef.current
		const child = childRef.current
		const stopPropagation = (e: Event) => e.stopPropagation()

		if (current && child) {
			current.addEventListener('mousedown', mouseDownHandler)
			child.addEventListener('mousedown', stopPropagation)
		}

		return () => {
			if (current && child) {
				current.removeEventListener('mousedown', mouseDownHandler)
				child.removeEventListener('mousedown', stopPropagation)
			}
		}
	}, [])

	const hoverSize = option.hoverSize ?? 4
	const minWidth = option.minWidth ?? 100
	const minHeight = option.minHeight ?? 100
	const maxWidth = option.maxWidth ?? 800
	const maxHeight = option.maxHeight ?? 800
	const onDraggingInterval = option.onDraggingInterval ?? 100
	let onDraggingAllow = true
	const basicStyle: React.CSSProperties = {}

	const moveX =
		option.direction.indexOf('left') > -1 ||
		option.direction.indexOf('start') > -1 ||
		option.direction === 'left' ||
		option.direction === 'start' ||
		option.direction.indexOf('right') > -1 ||
		option.direction.indexOf('end') > -1 ||
		option.direction === 'right' ||
		option.direction === 'end'
	const moveY =
		option.direction.indexOf('top') > -1 ||
		option.direction === 'top' ||
		option.direction.indexOf('bottom') > -1 ||
		option.direction === 'bottom'

	if (!(moveX || moveY))
		new Error('invaild dragAbleDiv param - option > direction')

	function mouseDownHandler(e: MouseEvent) {
		e.preventDefault()
		if (currentRef.current) {
			prevPos.x = e.clientX
			prevPos.y = e.clientY
			prevPos.width = currentRef.current.clientWidth
			prevPos.height = currentRef.current.clientHeight
			document.addEventListener('mousemove', mouseMoveHandler)
			document.addEventListener('mouseup', mouseUpHandler)
		}
	}

	function mouseMoveHandler(e: MouseEvent) {
		if (currentRef.current) {
			const dx = e.clientX - prevPos.x + prevPos.width
			const dy = e.clientY - prevPos.y + prevPos.height
			if (moveX) {
				const nPosX = minWidth > dx ? minWidth : maxWidth < dx ? maxWidth : dx
				currentRef.current.style.width = `${nPosX}px`
				movedPx.x = nPosX - hoverSize
			}
			if (moveY) {
				const nPosY =
					minHeight > dy ? minHeight : maxHeight < dy ? maxHeight : dy
				currentRef.current.style.height = `${nPosY}px`
				movedPx.y = nPosY - hoverSize
			}
			if (onDragging && onDraggingAllow) {
				onDragging(movedPx)
				onDraggingAllow = false
				setTimeout(() => {
					onDraggingAllow = true
				}, onDraggingInterval)
			}
		}
	}

	function mouseUpHandler() {
		document.removeEventListener('mousemove', mouseMoveHandler)
		document.removeEventListener('mouseup', mouseUpHandler)
		if (currentRef.current) {
			if (onDragEnd) onDragEnd(movedPx)
		}
	}

	function setPreventDefault(e: React.MouseEvent) {
		e.preventDefault()
		return false
	}

	return (
		<div
			ref={mergeRefs(ref, currentRef)}
			className={classname}
			style={{ ...basicStyle, ...style }}
			onMouseDown={setPreventDefault}
			onDrag={setPreventDefault}
		>
			<div className="flex flex-row w-full h-full">
				<div ref={childRef} className="grow">
					{children}
				</div>
				<div
					className="border-r transition-colors"
					style={{ width: hoverSize, cursor: 'w-resize' }}
					onMouseEnter={(e) => {
						if (option.hoverColor) {
							e.currentTarget.style.backgroundColor = `var(--color-${option.hoverColor})`
							e.currentTarget.style.borderColor = `var(--color-${option.hoverColor})`
						}
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.backgroundColor = ''
						e.currentTarget.style.borderColor = ''
					}}
				></div>
			</div>
		</div>
	)
}
