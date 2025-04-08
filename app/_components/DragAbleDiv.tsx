import { useRef } from "react";

export interface DragAbleDivOption {
  direction: Array<'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'> | 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';
  borderSize?: number;
}

export default function DragAbleDiv ({ children, option, classname = '', style, onDragEnd }: {
  children: React.ReactNode,
  option: {
    direction: Array<'top' | 'bottom' | 'left' | 'right' | 'start' | 'end'> | 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';
    borderSize?: number
  },
  classname?: string,
  style?: React.CSSProperties
  onDragEnd?: (e: { direction: string, movedPx: number }) => void
}) {
  const ref = useRef<HTMLDivElement>(null);

  const prevPos = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }

  const borderSize = option.borderSize ?? 4;

  const basicClassName = 
    option.direction instanceof Array ?
      (option.direction.indexOf('top') > -1 ? `pt-[${borderSize}px]` : '')
       + (option.direction.indexOf('bottom') > -1 ? `pb-[${borderSize}px]` : '')
       + (option.direction.indexOf('left') > -1 || option.direction.indexOf('start') > -1 ? `pl-[${borderSize}px]` : '')
       + (option.direction.indexOf('right') > -1 || option.direction.indexOf('end') > -1 ? `pr-[${borderSize}px]` : '')
       :
      option.direction === 'top' ? `pt-[${borderSize}px]`
       : option.direction === 'bottom' ? `pb-[${borderSize}px]`
       : option.direction === 'left' || option.direction === 'start' ? `pl-[${borderSize}px]`
       : option.direction === 'right' || option.direction === 'end' ? `pr-[${borderSize}px]`
       : '';
  
  if(basicClassName === '') new Error('invaild dragAbleDiv param - option > direction');

  function mouseDownHandler(e: React.MouseEvent) {
    if(ref.current) {
      prevPos.x = e.clientX;
      prevPos.y = e.clientY;
      prevPos.width = ref.current.clientWidth
      prevPos.height = ref.current.clientHeight
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    }
  }

  function mouseMoveHandler() {
    
  }

  function mouseUpHandler() {
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }

  return (
    <div ref={ref} className={`drag-able-div ${basicClassName} ${classname}`} style={style} onClick={mouseDownHandler}>
      {children}
    </div>
  );
}

