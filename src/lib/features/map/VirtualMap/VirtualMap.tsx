import { ActionIcon, Divider } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { useGesture } from '@use-gesture/react';
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef } from 'react';
import { animated, useSpring } from 'react-spring';
import type { VirtualMapTypes as Types } from './VirtualMap.types';

/**
 * VirtualMap component
 * IMPORTANT: Beware of transform-origin of div (50%, 50%) vs svg (0, 0) elements
 * @author filipditrich <filip.ditirch@plus4u.net>
 * @constructor
 */
export const VirtualMap: FunctionComponent<Types.Props> = ({
	withRotation = false,
	fill,
	minScaleFactor = 1.15,
	maxScaleFactor = 0.35,
	children,
	baseHeight,
	baseWidth,
	...props
}) => {
	const containerRef = useRef<SVGSVGElement | null>(null);
	const contentRef = useRef<SVGGElement | null>(null);

	/** calculate min/max scale */
	const { minScale, maxScale } = useMemo(
		() => ({
			minScale: props.width / (baseWidth * minScaleFactor),
			maxScale: props.width / (baseWidth * maxScaleFactor),
		}),
		[baseWidth, maxScaleFactor, minScaleFactor, props.width],
	);

	/** react-spring API handler */
	const [style, spring] = useSpring(() => {
		const initialScale = minScale * 0.1;
		return {
			x: props.width / 2 - (baseWidth * initialScale) / 2,
			y: props.height / 2 - (baseHeight * initialScale) / 2,
			scale: initialScale,
			rotateZ: 0,
			config: {
				tension: 170,
				friction: 23,
			},
		};
	});

	/** animate scale update */
	useEffect(() => {
		const scale = minScale * 1.025;
		spring.start({
			x: props.width / 2 - (baseWidth * scale) / 2,
			y: props.height / 2 - (baseHeight * scale) / 2,
			rotateZ: 0,
			scale,
		});
	}, [baseHeight, baseWidth, minScale, props.height, props.width, spring]);

	useGesture(
		{
			/** register onDrag handler to pan the map */
			onDrag: ({ pinching, cancel, offset: [x, y] }) => {
				if (pinching) return cancel();
				return spring.start({ x, y });
			},
			/** register onPinch handler to zoom the map */
			onPinch: ({ origin: [ox, oy], first, movement: [ms], offset: [s, a], memo }) => {
				if (first) {
					const { x, y } = contentRef.current!.getBoundingClientRect();
					const tx = ox - x;
					const ty = oy - y;
					memo = { x: style.x.get(), y: style.y.get(), tx, ty };
				}

				const x = memo.x - (ms - 1) * memo.tx;
				const y = memo.y - (ms - 1) * memo.ty;
				spring.start({ scale: s, rotateZ: withRotation ? a : 0, x, y });
				return memo;
			},
		},
		{
			/** gesture target ref */
			target: containerRef.current ?? undefined,
			drag: {
				/** initial position offset (must be in order to be sync with initial config) */
				from: () => [style.x.get(), style.y.get()],
			},
			pinch: {
				/** scale min/max bounds */
				scaleBounds: () => ({ min: minScale, max: maxScale }),
				/** initial scale offset (must be in order to be sync with initial config) */
				from: () => [style.scale.get(), style.rotateZ.get()],
				/** use touch events on touch-enabled devices */
				pointer: { touch: true },
				/** enables pinch behavior upon scrolling */
				modifierKey: null,
				rubberband: true,
			},
			eventOptions: {
				/** prevent default touch device behavior while pinching */
				passive: false,
			},
		},
	);

	/** zoom in/out handler */
	const handleZoomAction = useCallback(
		(zoomValue: number) => {
			/** add `zoomValue` to the current scale */
			const scale = style.scale.get() + zoomValue;
			/** zoom in the current center */
			const x = style.x.get() - (baseWidth * zoomValue) / 2;
			const y = style.y.get() - (baseHeight * zoomValue) / 2;
			/** animate scale update */
			spring.start({ scale, x, y });
		},
		[baseHeight, baseWidth, spring, style.scale, style.x, style.y],
	);

	return (
		<div className="relative">
			{/* zoom controls */}
			<div className="absolute left-4 top-4 z-10 flex flex-col gap-2 rounded-md border border-gray-200 bg-white p-1 shadow-sm">
				{/* zoom in button */}
				<ActionIcon variant="subtle" onClick={() => handleZoomAction(0.5)}>
					<IconPlus size="1rem" />
				</ActionIcon>
				{/* divider */}
				<Divider />
				{/* zoom out button */}
				<ActionIcon variant="subtle" onClick={() => handleZoomAction(-0.5)}>
					<IconMinus size="1rem" />
				</ActionIcon>
			</div>

			{/* svg */}
			<svg
				ref={containerRef}
				{...props}
				style={{
					/** prevent default touch device behavior while pinching */
					touchAction: 'none',
					overflow: 'hidden',
					...props.style,
				}}
			>
				{/* background rect */}
				<rect width="100%" height="100%" fill={fill} />
				{/* main transformable group */}
				<animated.g ref={contentRef} style={style}>
					{children}
				</animated.g>
			</svg>
		</div>
	);
};
