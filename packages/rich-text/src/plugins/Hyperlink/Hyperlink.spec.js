import React from 'react';
import _ from 'lodash-es';
import { mount, shallow } from 'enzyme';

import Hyperlink from './Hyperlink';
import WidgetAPIContext from '../shared/WidgetApiContext';
import { getScheduledJobsTooltip } from './index';

const ScheduledActionActions = {
  Publish: 'publish',
  Unpublish: 'unpublish'
};

describe('Hyperlink', () => {
  let target;
  let node;
  let widgetAPIMock;

  beforeEach(() => {
    target = {
      sys: {
        id: 'entityId',
        linkType: 'Entry'
      }
    };

    node = {
      data: {
        get: jest.fn().mockReturnValue(target)
      }
    };

    widgetAPIMock = {
      prevUrl: {
        pathname: '/'
      },
      currentUrl: {
        pathname: '/'
      },
      field: {
        locale: 'en-US'
      },
      space: {
        getEntry: jest.fn().mockResolvedValue({
          sys: { type: 'Entry', contentType: { sys: { id: 'contentTypeId' } } }
        }),
        getAsset: jest.fn().mockResolvedValue({
          sys: { type: 'Asset', contentType: { sys: { id: 'contentTypeId' } } }
        }),
        getContentType: jest.fn().mockResolvedValue({ name: 'Entry' })
      },
      jobs: {
        getPendingJobs: jest.fn()
      }
    };
  });

  it('should inject the tooltip for the referenced scheduled entity', () => {return new Promise(done => {
    const jobs = [
      {
        action: ScheduledActionActions.Publish,
        scheduledAt: new Date().toISOString(),
        sys: {
          id: 'job1',
          entity: {
            sys: {
              id: target.sys.id
            }
          }
        }
      }
    ];

    widgetAPIMock.jobs.getPendingJobs.mockReturnValue(jobs);

    const tooltipDataStub = jest.fn(entityType =>
      getScheduledJobsTooltip(entityType, node, widgetAPIMock)
    );

    const wrapper = mount(
      <WidgetAPIContext.Provider value={{ widgetAPI: widgetAPIMock }}>
        <Hyperlink attributes={{}} onClick={_.noop()} node={node} getTooltipData={tooltipDataStub}>
          Hiya!
        </Hyperlink>
      </WidgetAPIContext.Provider>
    );

    expect(wrapper.exists('Tooltip')).toBe(true);
    wrapper.find('Tooltip').simulate('mouseover');
    // to let the widgetAPI request get fired
    setTimeout(() => {
      expect(tooltipDataStub).toHaveBeenCalledWith('Entry');
      wrapper.update();
      const scheduleInfo = wrapper.find('ScheduleTooltipContent');
      expect(scheduleInfo.exists()).toBe(true);
      expect(scheduleInfo.prop('job')).toEqual(jobs[0]);
      done();
    }, 0);
  })});

  it('should not inject the tooltip for the referenced unscheduled entity', () => {return new Promise(done => {
    const jobs = [
      {
        action: ScheduledActionActions.Publish,
        scheduledAt: new Date().toISOString(),
        sys: {
          id: 'job1',
          entity: {
            sys: {
              id: 'non-existent-entry'
            }
          }
        }
      }
    ];

    widgetAPIMock.jobs.getPendingJobs = jest.fn().mockReturnValue(jobs);

    const tooltipDataStub = jest.fn(entityType =>
      getScheduledJobsTooltip(entityType, node, widgetAPIMock)
    );

    const wrapper = mount(
      <WidgetAPIContext.Provider value={{ widgetAPI: widgetAPIMock }}>
        <Hyperlink attributes={{}} onClick={_.noop()} node={node} getTooltipData={tooltipDataStub}>
          Hiya!
        </Hyperlink>
      </WidgetAPIContext.Provider>
    );

    expect(wrapper.exists('Tooltip')).toBe(true);
    wrapper.find('Tooltip').simulate('mouseover');

    setTimeout(() => {
      expect(tooltipDataStub).toHaveBeenCalledWith('Entry');
      wrapper.update();
      expect(wrapper.exists('#test-marker')).toBe(false);
      expect(wrapper.exists('ScheduleTooltipContent')).toBe(false);
      done();
    }, 0);
  })});
});

describe("Hyperlink's default getScheduledJobsTooltip", () => {
  it('should return null if entityType is not Entry', () => {
    expect(getScheduledJobsTooltip('Asset')).toBeNull();
  });

  it('should return null if node is malformed or undefined', () => {
    expect(getScheduledJobsTooltip('Entry', undefined)).toBeNull();
    expect(getScheduledJobsTooltip('Entry', {})).toBeNull();
    expect(getScheduledJobsTooltip('Entry', { data: {} })).toBeNull();
    expect(getScheduledJobsTooltip('Entry', { data: { get: 1 } })).toBeNull();
  });

  it('should return null if widgetAPI is undefined', () => {
    const node = {
      data: {
        get: jest.fn()
      }
    };
    expect(getScheduledJobsTooltip('Entry', node, undefined)).toBeNull();
    expect(getScheduledJobsTooltip('Entry', node, {})).toBeNull();
    expect(getScheduledJobsTooltip('Entry', node, { jobs: {} })).toBeNull();
    expect(getScheduledJobsTooltip('Entry', node, { jobs: { getPendingJobs: 1 } })).toBeNull();
  });

  it('should asc sort the array of pending jobs and reutrn the summary component', () => {
    const entry = {
      sys: {
        id: 1
      }
    };

    const node = {
      data: {
        get: jest.fn().mockReturnValue(entry)
      }
    };

    const jobs = [
      {
        action: ScheduledActionActions.Publish,
        scheduledAt: new Date(Date.now() * 2).toISOString(),
        sys: {
          id: 'job1',
          entity: {
            sys: {
              id: entry.sys.id
            }
          }
        }
      },
      {
        action: ScheduledActionActions.Unpublish,
        scheduledAt: new Date(Date.now() * 0.5).toISOString(),
        sys: {
          id: 'job2',
          entity: {
            sys: {
              id: entry.sys.id
            }
          }
        }
      },
      {
        action: ScheduledActionActions.Publish,
        scheduledAt: new Date(Date.now() * 0.1).toISOString(),
        sys: {
          id: 'job3',
          entity: {
            sys: {
              id: entry.sys.id
            }
          }
        }
      }
    ];

    const widgetAPIMock = {
      jobs: {
        getPendingJobs: jest.fn().mockReturnValue(jobs)
      }
    };

    const Wrapper = () => getScheduledJobsTooltip('Entry', node, widgetAPIMock);

    const wrapper = shallow(<Wrapper />);
    const content = wrapper.find('ScheduleTooltipContent');
    expect(content.exists()).toBe(true);
    expect(content.prop('job')).toEqual(jobs[jobs.length - 1]);
    expect(content.prop('jobsCount')).toBe(jobs.length);
  });
});
