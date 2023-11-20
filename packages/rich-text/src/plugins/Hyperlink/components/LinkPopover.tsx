import * as React from 'react';

import { Popover, IconButton, Tooltip, Flex } from '@contentful/f36-components';
import { EditIcon, CopyIcon } from '@contentful/f36-icons';

import { useFocused } from '../../../internal/hooks';
import { styles } from './styles';

type LinkPopoverProps = {
  isLinkFocused: boolean | undefined;
  popoverText: React.ReactNode;
  handleEditLink: () => void;
  handleRemoveLink: () => void;
  children: React.ReactNode;
  handleCopyLink?: () => void;
};

export const LinkPopover = ({
  isLinkFocused,
  popoverText,
  handleEditLink,
  handleRemoveLink,
  children,
  handleCopyLink,
}: LinkPopoverProps) => {
  const isEditorFocused = useFocused();
  const popoverContent = React.useRef<HTMLDivElement | null>(null);
  const [isPopoverContentClicked, setIsPopoverContentClicked] = React.useState(false);

  React.useEffect(() => {
    const handleMouseDown = (event) => {
      if (popoverContent.current && popoverContent.current.contains(event.target)) {
        setIsPopoverContentClicked(true);
      } else {
        setIsPopoverContentClicked(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const isOpen = (isLinkFocused && isEditorFocused) || isPopoverContentClicked;

  // Important to render this component in a portal
  // Otherwise the content of the popover will get copied over when users copy text from the rich text editor

  return (
    // eslint-disable-next-line jsx-a11y/no-autofocus -- we don't want to autofocus the popover
    <Popover renderOnlyWhenOpen={false} usePortal={true} autoFocus={false} isOpen={isOpen}>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content className={styles.popover}>
        <Flex
          ref={popoverContent}
          alignItems="center"
          paddingTop="spacing2Xs"
          paddingBottom="spacing2Xs"
          paddingRight="spacing2Xs"
          paddingLeft="spacingXs"
        >
          {popoverText}
          {handleCopyLink && (
            <Tooltip placement="bottom" content="Copy link" usePortal>
              <IconButton
                className={styles.iconButton}
                onClick={handleCopyLink}
                size="small"
                variant="transparent"
                aria-label="Copy link"
                icon={<CopyIcon size="tiny" />}
              />
            </Tooltip>
          )}
          <Tooltip placement="bottom" content="Edit link" usePortal>
            <IconButton
              className={styles.iconButton}
              onClick={handleEditLink}
              size="small"
              variant="transparent"
              aria-label="Edit link"
              icon={<EditIcon size="tiny" />}
            />
          </Tooltip>
          <Tooltip placement="bottom" content="Remove link" usePortal>
            <IconButton
              onClick={handleRemoveLink}
              className={styles.iconButton}
              size="small"
              variant="transparent"
              aria-label="Remove link"
              icon={
                //@TODO: Replace icon when available in f36
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.75 8C1.75 8.59674 1.98705 9.16903 2.40901 9.59099C2.83097 10.0129 3.40326 10.25 4 10.25H6.5C6.69891 10.25 6.88968 10.329 7.03033 10.4697C7.17098 10.6103 7.25 10.8011 7.25 11C7.25 11.1989 7.17098 11.3897 7.03033 11.5303C6.88968 11.671 6.69891 11.75 6.5 11.75H4C3.00544 11.75 2.05161 11.3549 1.34835 10.6517C0.645088 9.94839 0.25 8.99456 0.25 8C0.25 7.00544 0.645088 6.05161 1.34835 5.34835C2.05161 4.64509 3.00544 4.25 4 4.25H6.5C6.69891 4.25 6.88968 4.32902 7.03033 4.46967C7.17098 4.61032 7.25 4.80109 7.25 5C7.25 5.19891 7.17098 5.38968 7.03033 5.53033C6.88968 5.67098 6.69891 5.75 6.5 5.75H4C3.40326 5.75 2.83097 5.98705 2.40901 6.40901C1.98705 6.83097 1.75 7.40326 1.75 8ZM12 4.25H9.5C9.30109 4.25 9.11032 4.32902 8.96967 4.46967C8.82902 4.61032 8.75 4.80109 8.75 5C8.75 5.19891 8.82902 5.38968 8.96967 5.53033C9.11032 5.67098 9.30109 5.75 9.5 5.75H12C12.5967 5.75 13.169 5.98705 13.591 6.40901C14.0129 6.83097 14.25 7.40326 14.25 8C14.25 8.59674 14.0129 9.16903 13.591 9.59099C13.169 10.0129 12.5967 10.25 12 10.25H9.5C9.30109 10.25 9.11032 10.329 8.96967 10.4697C8.82902 10.6103 8.75 10.8011 8.75 11C8.75 11.1989 8.82902 11.3897 8.96967 11.5303C9.11032 11.671 9.30109 11.75 9.5 11.75H12C12.9946 11.75 13.9484 11.3549 14.6517 10.6517C15.3549 9.94839 15.75 8.99456 15.75 8C15.75 7.00544 15.3549 6.05161 14.6517 5.34835C13.9484 4.64509 12.9946 4.25 12 4.25Z"
                    fill="black"
                  />
                </svg>
              }
            />
          </Tooltip>
        </Flex>
      </Popover.Content>
    </Popover>
  );
};
