import * as React from 'react';
import { INLINES } from '@contentful/rich-text-types';
import {
  Modal,
  Form,
  TextField,
  Button,
  SelectField,
  Option,
} from '@contentful/forma-36-react-components';
import { ModalDialogLauncher } from '@contentful/field-editor-shared';
import { SPEditor } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import { insertLink } from '../../helpers/editor';

interface HyperlinkModalProps {
  linkText?: string;
  linkType?: string;
  linkTarget?: string;
  onClose: (value: unknown) => void;
}

export function HyperlinkModal(props: HyperlinkModalProps) {
  const [linkText, setLinkText] = React.useState(props.linkText ?? '');
  const [linkType, setLinkType] = React.useState(props.linkType ?? INLINES.HYPERLINK);
  const [linkTarget, setLinkTarget] = React.useState(props.linkTarget ?? '');

  function handleOnSubmit(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    props.onClose({ linkText, linkType, linkTarget });
  }

  function isLinkComplete() {
    if (linkType === INLINES.HYPERLINK) {
      return linkText && linkTarget;
    }

    return false;
  }

  return (
    <React.Fragment>
      <Modal.Content>
        <Form>
          <TextField
            name="linkText"
            id="linkText"
            labelText="Link text"
            value={linkText}
            required={true}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setLinkText(event.target.value)
            }
            textInputProps={{
              testId: 'link-text-input',
            }}
          />

          <SelectField
            labelText="Link type"
            value={linkType}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setLinkType(event.target.value)
            }
            name="linkType"
            id="linkType"
            selectProps={{ testId: ' link-type-input' }}>
            <Option value={INLINES.HYPERLINK}>URL</Option>
            <Option value={INLINES.ENTRY_HYPERLINK}>Entry</Option>
            <Option value={INLINES.ASSET_HYPERLINK}>Asset</Option>
          </SelectField>

          {linkType === INLINES.HYPERLINK && (
            <TextField
              name="linkTarget"
              id="linkTarget"
              labelText="Link target"
              helpText="A protocol may be required, e.g. https://"
              value={linkTarget}
              required={true}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setLinkTarget(event.target.value)
              }
              textInputProps={{
                testId: 'link-target-input',
              }}
            />
          )}
        </Form>
      </Modal.Content>
      <Modal.Controls>
        <Button
          type="submit"
          buttonType="positive"
          disabled={!isLinkComplete()}
          onClick={handleOnSubmit}
          testId="confirm-cta">
          Insert
        </Button>
        <Button
          type="button"
          onClick={() => props.onClose(null)}
          buttonType="muted"
          testId="cancel-cta">
          Cancel
        </Button>
      </Modal.Controls>
    </React.Fragment>
  );
}

interface addOrEditLinkProps {
  linkText?: string;
  linkTarget?: string;
  linkType?: INLINES.HYPERLINK | INLINES.ASSET_HYPERLINK | INLINES.ENTRY_HYPERLINK;
}

interface HyperLinkDialogData {
  linkText: string;
  linkTarget: string;
}

export async function addOrEditLink(
  editor: ReactEditor & HistoryEditor & SPEditor,
  { linkText, linkTarget, linkType }: addOrEditLinkProps = {}
) {
  if (!editor.selection) return;

  const selectionBeforeBlur = { ...editor.selection };
  const currentLinkText = linkText ?? Editor.string(editor, editor.selection);

  const data = await ModalDialogLauncher.openDialog(
    {
      title: 'Insert hyperlink', // TODO: Add support for edit hyperlink
      width: 'large',
      shouldCloseOnEscapePress: true,
      shouldCloseOnOverlayClick: true,
      allowHeightOverflow: true,
    },
    ({ onClose }) => {
      return (
        <HyperlinkModal
          onClose={onClose}
          linkText={currentLinkText}
          linkTarget={linkTarget}
          linkType={linkType}
        />
      );
    }
  );

  if (!data) return;

  const { linkText: text, linkTarget: url } = data as HyperLinkDialogData;

  Transforms.select(editor, selectionBeforeBlur);

  insertLink(editor, text, url);
}
