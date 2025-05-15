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
	children,
	option,
	classname = '',
	style,
	onDragging,
	onDragEnd,
}: {
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
	const ref = useRef<HTMLDivElement>(null)
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
		if (ref.current && childRef.current) {
			ref.current.addEventListener('mousedown', mouseDownHandler)
			childRef.current.addEventListener('mousedown', (e: Event) => {
				e.stopPropagation()
			})
		}
	}, [ref, childRef])

	const hoverSize = option.hoverSize ?? 4
	const minWidth = option.minWidth ?? 100
	const minHeight = option.minHeight ?? 100
	const maxWidth = option.maxWidth ?? 800
	const maxHeight = option.maxWidth ?? 800
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
		if (ref.current) {
			prevPos.x = e.clientX
			prevPos.y = e.clientY
			prevPos.width = ref.current.clientWidth
			prevPos.height = ref.current.clientHeight
			document.addEventListener('mousemove', mouseMoveHandler)
			document.addEventListener('mouseup', mouseUpHandler)
		}
	}

	function mouseMoveHandler(e: MouseEvent) {
		if (ref.current) {
			const dx = e.clientX - prevPos.x + prevPos.width
			const dy = e.clientY - prevPos.y + prevPos.height
			if (moveX) {
				const nPosX = minWidth > dx ? minWidth : maxWidth < dx ? maxWidth : dx
				ref.current.style.width = `${nPosX}px`
				movedPx.x = nPosX - hoverSize
			}
			if (moveY) {
				const nPosY =
					minHeight > dy ? minHeight : maxHeight < dy ? maxHeight : dy
				ref.current.style.height = `${nPosY}px`
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
		if (ref.current) {
			if (onDragEnd) onDragEnd(movedPx)
		}
	}

	function setPreventDefault(e: React.MouseEvent) {
		e.preventDefault()
		return false
	}

	return (
		<div
			ref={ref}
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
					className={
						'border-r-[1px]' +
						(option.hoverColor &&
							` hover:bg-${option.hoverColor} hover:border-${option.hoverColor}`)
					}
					style={{ width: hoverSize, cursor: 'w-resize' }}
				></div>
			</div>
		</div>
	)
}
