React Rnd Documentation. 
Allows draggable and resizable components.
Usage
Example with default
<Rnd
  default={{
    x: 0,
    y: 0,
    width: 320,
    height: 200,
  }}
>
  Rnd
</Rnd>
Example with position and size
<Rnd
  size={{ width: this.state.width,  height: this.state.height }}
  position={{ x: this.state.x, y: this.state.y }}
  onDragStop={(e, d) => { this.setState({ x: d.x, y: d.y }) }}
  onResizeStop={(e, direction, ref, delta, position) => {
    this.setState({
      width: ref.style.width,
      height: ref.style.height,
      ...position,
    });
  }}
>
  001
</Rnd>
Props
default: { x: number; y: number;  width?: number | string;  height?: number | string; };
The width and height property is used to set the default size of the component. For example, you can set 300, '300px', 50%. If omitted, set 'auto'.

The x and y property is used to set the default position of the component.

size?: { width: (number | string), height: (number | string) };
The size property is used to set size of the component. For example, you can set 300, '300px', 50%.

Use size if you need to control size state by yourself.

position?: { x: number, y: number };
The position property is used to set position of the component. Use position if you need to control size state by yourself.

see, following example.

<Rnd
  size={{ width: this.state.width,  height: this.state.height }}
  position={{ x: this.state.x, y: this.state.y }}
  onDragStop={(e, d) => { this.setState({ x: d.x, y: d.y }) }}
  onResize={(e, direction, ref, delta, position) => {
    this.setState({
      width: ref.offsetWidth,
      height: ref.offsetHeight,
      ...position,
    });
  }}
>
  001
</Rnd>
className?: string;
The className property is used to set the custom className of the component.

style?: { [key: string]: string };
The style property is used to set the custom style of the component.

minWidth?: number | string;
The minWidth property is used to set the minimum width of the component. For example, you can set 300, '300px', 50%.

minHeight?: number | string;
The minHeight property is used to set the minimum height of the component. For example, you can set 300, '300px', 50%.

maxWidth?: number | string;
The maxWidth property is used to set the maximum width of the component. For example, you can set 300, '300px', 50%.

maxHeight?: number | string;
The maxHeight property is used to set the maximum height of the component. For example, you can set 300, '300px', 50%.

resizeGrid?: [number, number];
The resizeGrid property is used to specify the increments that resizing should snap to. Defaults to [1, 1].

dragGrid?: [number, number];
The dragGrid property is used to specify the increments that moving should snap to. Defaults to [1, 1].

lockAspectRatio?: boolean | number;
The lockAspectRatio property is used to lock aspect ratio. Set to true to lock the aspect ratio based on the initial size. Set to a numeric value to lock a specific aspect ratio (such as 16/9). If set to numeric, make sure to set initial height/width to values with correct aspect ratio. If omitted, set false.

lockAspectRatioExtraWidth?: number;
The lockAspectRatioExtraWidth property enables a resizable component to maintain an aspect ratio plus extra width. For instance, a video could be displayed 16:9 with a 50px side bar. If omitted, set 0.

scale?: number;
Specifies the scale of the canvas you are dragging or resizing this element on. This allows you to, for example, get the correct drag / resize deltas while you are zoomed in or out via a transform or matrix in the parent of this element. If omitted, set 1.

lockAspectRatioExtraHeight?: number;
The lockAspectRatioExtraHeight property enables a resizable component to maintain an aspect ratio plus extra height. For instance, a video could be displayed 16:9 with a 50px header bar. If omitted, set 0.

dragHandleClassName?: string;
Specifies a selector to be used as the handle that initiates drag. Example: handle.

resizeHandleStyles?: HandleStyles;
The resizeHandleStyles property is used to override the style of one or more resize handles. Only the axis you specify will have its handle style replaced. If you specify a value for right it will completely replace the styles for the right resize handle, but other handle will still use the default styles.

export type HandleStyles = {
  bottom?: React.CSSProperties,
  bottomLeft?: React.CSSProperties,
  bottomRight?: React.CSSProperties,
  left?: React.CSSProperties,
  right?: React.CSSProperties,
  top?: React.CSSProperties,
  topLeft?: React.CSSProperties,
  topRight?: React.CSSProperties
}
resizeHandleClasses?: HandleClasses;
The resizeHandleClasses property is used to set the className of one or more resize handles.

type HandleClasses = {
  bottom?: string;
  bottomLeft?: string;
  bottomRight?: string;
  left?: string;
  right?: string;
  top?: string;
  topLeft?: string;
  topRight?: string;
}
resizeHandleComponent?: HandleCompoent;`
The resizeHandleComponent allows you to pass a custom React component as the resize handle.

type HandleComponent = {
  top?: React.ReactElement<any>;
  right?: React.ReactElement<any>;
  bottom?: React.ReactElement<any>;
  left?: React.ReactElement<any>;
  topRight?: React.ReactElement<any>;
  bottomRight?: React.ReactElement<any>;
  bottomLeft?: React.ReactElement<any>;
  topLeft?: React.ReactElement<any>;
}
resizeHandleWrapperClass?: string;
The resizeHandleWrapperClass property is used to set css class name of resize handle wrapper(span) element.

resizeHandleWrapperStyle?: Style;
The resizeHandleWrapperStyle property is used to set css class name of resize handle wrapper(span) element.

enableResizing?: ?Enable;
The enableResizing property is used to set the resizable permission of the component.

The permission of top, right, bottom, left, topRight, bottomRight, bottomLeft, topLeft direction resizing. If omitted, all resizer are enabled. If you want to permit only right direction resizing, set { top:false, right:true, bottom:false, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false }.

export type Enable = {
  bottom?: boolean;
  bottomLeft?: boolean;
  bottomRight?: boolean;
  left?: boolean;
  right?: boolean;
  top?: boolean;
  topLeft?: boolean;
  topRight?: boolean;
} | boolean
disableDragging?: boolean;
The disableDragging property disables dragging completely.

cancel?: string;
The cancel property disables specifies a selector to be used to prevent drag initialization (e.g. .body).

dragAxis?: 'x' | 'y' | 'both' | 'none'
The direction of allowed movement (dragging) allowed ('x','y','both','none').

bounds?: string; | Element
Specifies movement boundaries. Accepted values:

parent restricts movement within the node's offsetParent (nearest node with position relative or absolute)
window, body, Selector like .fooClassName or
Element.
enableUserSelectHack?: boolean;
By default, we add 'user-select:none' attributes to the document body
to prevent ugly text selection during drag. If this is causing problems
for your app, set this to false.

scale?: number;
Specifies the scale of the canvas your are resizing and dragging this element on. This allows you to, for example, get the correct resize and drag deltas while you are zoomed in or out via a transform or matrix in the parent of this element. If omitted, set 1.

Callback
onResizeStart?: RndResizeStartCallback;
RndResizeStartCallback type is below.

export type RndResizeStartCallback = (
  e: SyntheticMouseEvent<HTMLDivElement> | SyntheticTouchEvent<HTMLDivElement>,
  dir: ResizeDirection,
  refToElement: React.ElementRef<'div'>,
) => void;
Calls when resizable component resize start.

onResize?: RndResizeCallback;
RndResizeCallback type is below.

export type RndResizeCallback = (
  e: MouseEvent | TouchEvent,
  dir: ResizeDirection,
  refToElement: React.ElementRef<'div'>,
  delta: ResizableDelta,
  position: Position,
) => void;
Calls when resizable component resizing.

onResizeStop?: RndResizeCallback;
RndResizeCallback type is below.

export type RndResizeCallback = (
  e: MouseEvent | TouchEvent,
  dir: ResizeDirection,
  refToElement: React.ElementRef<'div'>,
  delta: ResizableDelta,
  position: Position,
) => void;
Calls when resizable component resize stop.

onDragStart: DraggableEventHandler;
Callback called on dragging start.

type DraggableData = {
  node: HTMLElement,
  x: number,
  y: number,
  deltaX: number, deltaY: number,
  lastX: number, lastY: number
};

type DraggableEventHandler = (
  e: SyntheticMouseEvent | SyntheticTouchEvent, data: DraggableData,
) => void | false;
onDrag: DraggableEventHandler;
onDrag called with the following parameters:

type DraggableData = {
  node: HTMLElement,
  x: number,
  y: number,
  deltaX: number, deltaY: number,
  lastX: number, lastY: number
};

type DraggableEventHandler = (
  e: SyntheticMouseEvent | SyntheticTouchEvent, data: DraggableData,
) => void | false;
onDragStop: DraggableEventHandler;
onDragStop called on dragging stop.

type DraggableData = {
  node: HTMLElement,
  x: number,
  y: number,
  deltaX: number, deltaY: number,
  lastX: number, lastY: number
};

type DraggableEventHandler = (
  e: SyntheticMouseEvent | SyntheticTouchEvent, data: DraggableData,
) => void | false;
Instance API
updateSize(size: { width: string | number, height: string | number })
Update component size. For example, you can set 300, '300px', 50%.

for example
class YourComponent extends Component {

  ...

  update() {
    this.rnd.updateSize({ width: 200, height: 300 });
  }

  render() {
    return (
      <Rnd ref={c => { this.rnd = c; }} ...rest >
        example
      </Rnd>
    );
  }
  ...
}
updatePosition({ x: number, y: number }): void
Update component position. grid bounds props is ignored, when this method called.

for example
class YourComponent extends Component {

  ...

  update() {
    this.rnd.updatePosition({ x: 200, y: 300 });
  }

  render() {
    return (
      <Rnd ref={c => { this.rnd = c; }} ...rest >
        example
      </Rnd>
    );
  }

  ...
}
allowAnyClick?: boolean
If set to true, will allow dragging on non left-button clicks.