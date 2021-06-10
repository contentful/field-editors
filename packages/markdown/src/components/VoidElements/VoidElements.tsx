import React, { useEffect } from 'react';
import { useVoidElements } from './useVoidElements';

type ElementProps = React.PropsWithChildren<Record<string, unknown>>;

type VoidElementProps = ElementProps & { Tag: string };

function VoidElement({ children, Tag, ...props }: VoidElementProps) {
  const { add, remove } = useVoidElements();

  useEffect(() => {
    if (!children) {
      return;
    }

    add();
    return () => remove();
  }, [add, remove, children]);

  return <Tag {...props} />;
}

// markdown-to-jsx does not provide the tag name for overrides
// so we have to wrap all elements
export const AreaElement = (props: ElementProps) => <VoidElement Tag="area" {...props} />;
export const BrElement = (props: ElementProps) => <VoidElement Tag="br" {...props} />;
export const ColElement = (props: ElementProps) => <VoidElement Tag="col" {...props} />;
export const HrElement = (props: ElementProps) => <VoidElement Tag="hr" {...props} />;
export const ImgElement = (props: ElementProps) => <VoidElement Tag="img" {...props} />;
export const InputElement = (props: ElementProps) => <VoidElement Tag="input" {...props} />;
export const SourceElement = (props: ElementProps) => <VoidElement Tag="source" {...props} />;
export const TrackElement = (props: ElementProps) => <VoidElement Tag="track" {...props} />;
export const WbrElement = (props: ElementProps) => <VoidElement Tag="wbr" {...props} />;
