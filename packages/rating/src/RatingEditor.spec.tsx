import React from 'react';
import { render, configure, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { createFakeFieldAPI } from '@contentful/field-editor-shared';
import { RatingEditor } from './RatingEditor';

configure({
  testIdAttribute: 'data-test-id'
});

describe('RatingEditor', () => {
  afterEach(cleanup);

  it('renders 5 stars by default', () => {
    const field = createFakeFieldAPI();
    const { getAllByTestId } = render(<RatingEditor field={field} isInitiallyDisabled={false} />);
    expect(getAllByTestId('rating-editor-star')).toHaveLength(5);
  });

  it('renders custom number of stars', () => {
    const field = createFakeFieldAPI();
    const { getAllByTestId } = render(
      <RatingEditor
        field={field}
        isInitiallyDisabled={false}
        parameters={{ installation: {}, instance: { stars: 20 } }}
      />
    );
    expect(getAllByTestId('rating-editor-star')).toHaveLength(20);
  });

  it('should should setValue by clicking on a item and removeValue by clicking on clear', () => {
    const field = createFakeFieldAPI(field => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field
      };
    });
    const { container, getAllByTestId, getByTestId, queryByTestId } = render(
      <RatingEditor field={field} isInitiallyDisabled={false} />
    );

    const $stars = getAllByTestId('rating-editor-star');
    expect(queryByTestId('rating-editor-clean')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-selected="true"]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-selected="false"]')).toHaveLength(5);

    fireEvent.click($stars[4]);
    expect(field.setValue).toHaveBeenCalledWith(5);
    expect(container.querySelectorAll('[data-selected="true"]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-selected="false"]')).toHaveLength(0);

    fireEvent.click($stars[0]);
    expect(field.setValue).toHaveBeenCalledWith(1);
    expect(container.querySelectorAll('[data-selected="true"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-selected="false"]')).toHaveLength(4);

    fireEvent.click(getByTestId('rating-editor-clear'));
    expect(field.removeValue).toHaveBeenCalled();
  });

  it('should should setValue by focusing and using Enter', () => {
    const field = createFakeFieldAPI(field => {
      jest.spyOn(field, 'setValue');
      jest.spyOn(field, 'removeValue');
      return {
        ...field
      };
    });
    const { container, getAllByTestId, queryByTestId } = render(
      <RatingEditor field={field} isInitiallyDisabled={false} />
    );

    const $stars = getAllByTestId('rating-editor-star');
    expect(queryByTestId('rating-editor-clean')).not.toBeInTheDocument();
    expect(container.querySelectorAll('[data-selected="true"]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-selected="false"]')).toHaveLength(5);

    fireEvent.focus($stars[2]);
    expect(container.querySelectorAll('[data-selected="true"]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-selected="false"]')).toHaveLength(2);
    fireEvent.keyDown($stars[2], { keyCode: 13 });
    expect(field.setValue).toHaveBeenCalledTimes(1);
    expect(field.setValue).toHaveBeenCalledWith(3);

    fireEvent.focus($stars[4]);
    expect(container.querySelectorAll('[data-selected="true"]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-selected="false"]')).toHaveLength(0);
    fireEvent.keyDown($stars[4], { keyCode: 13 });
    expect(field.setValue).toHaveBeenCalledTimes(2);
    expect(field.setValue).toHaveBeenCalledWith(5);
  });
});
