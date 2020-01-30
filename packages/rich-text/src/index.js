import { flow, curryRight } from 'lodash';
import connectToWidgetApi from 'app/widgets/WidgetApi/connectToWidgetApi';
import RichTextEditor from 'app/widgets/rich_text/RichTextEditor';
import withTracking from 'app/widgets/rich_text/withTracking';

export default flow(
  withTracking,
  curryRight(connectToWidgetApi)({
    updateValueOnComponentChange: false,
    // TODO: We should get rid of this behavior and update RT also
    //  while in enabled state if there are any updates by other
    //  users or via API. Currently this would break list related
    //  unit tests so we had to look into this.
    updateValueWhileEnabled: false
  })
)(RichTextEditor);
