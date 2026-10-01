/**
 * Turns the browser bill tree into something satori can draw:
 *  - AntD <Flex> → flex <div> with the same direction/justify/align/gap/wrap
 *  - AntD <Image> → <img>
 *  - `className` (Tailwind) → satori's `tw`
 *  - function / forwardRef / memo components are expanded here (templates are hook-free)
 */
import { Flex, Image } from 'antd';
import { omit } from 'lodash';
import React from 'react';

const FORWARD_REF = Symbol.for('react.forward_ref');
const MEMO = Symbol.for('react.memo');

const FLEX_GAP: Record<string, number> = { small: 8, middle: 16, large: 24 };

const dropEmpty = (style: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(style).filter(([, value]) => value !== undefined && value !== null),
  );

const hostProps = (props: Record<string, any>, style: Record<string, unknown> = {}) => {
  const { className, tw, style: ownStyle } = props;
  const rest = omit(props, ['className', 'tw', 'style', 'children']);
  const classes = [tw, className].filter(Boolean).join(' ');
  return {
    ...rest,
    ...(classes ? { tw: classes } : {}),
    style: dropEmpty({ ...style, ...ownStyle }),
  };
};

export const toSatoriTree = (node: React.ReactNode): React.ReactNode => {
  if (Array.isArray(node)) {
    return node.map((child, index) => {
      const converted = toSatoriTree(child);
      return React.isValidElement(converted)
        ? React.cloneElement(converted, { key: converted.key ?? index })
        : converted;
    });
  }
  if (!React.isValidElement(node)) return node;

  const { type } = node;
  const props = node.props as Record<string, any>;

  if (type === React.Fragment) return toSatoriTree(props.children);

  if (type === Flex) {
    const { vertical, wrap, justify, align, flex, gap } = props;
    const rest = omit(props, ['vertical', 'wrap', 'justify', 'align', 'flex', 'gap', 'component']);
    return React.createElement(
      'div',
      hostProps(rest, {
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        flexWrap: wrap === true ? 'wrap' : wrap || undefined,
        justifyContent: justify,
        alignItems: align,
        flex,
        gap: typeof gap === 'string' ? FLEX_GAP[gap] ?? gap : gap,
      }),
      toSatoriTree(props.children),
    );
  }

  if (type === Image) {
    const { src, width, height } = props;
    const rest = omit(props, ['preview', 'fallback', 'placeholder', 'rootClassName']);
    return React.createElement(
      'img',
      hostProps({ ...rest, src, width, height }, { width, height, objectFit: 'contain' }),
    );
  }

  if (typeof type === 'function') {
    return toSatoriTree((type as (p: any) => React.ReactNode)(props));
  }

  const exotic = type as any;
  if (exotic?.$$typeof === FORWARD_REF) return toSatoriTree(exotic.render(props, null));
  if (exotic?.$$typeof === MEMO) {
    return toSatoriTree(React.createElement(exotic.type, props));
  }

  return React.createElement(type as string, hostProps(props), toSatoriTree(props.children));
};
