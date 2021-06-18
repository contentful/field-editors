These custom plugins allow us to modify the rich text editor data tree by using the "data"
attribute which is available on all blocks. We were forced to use this attribute because it's
the only part of the tree that contentful doesn't validate.

The basic idea here is that each "plugin" will add its own key to the data attribute of any
currently selected "blocks" of text, based on what the plugin is trying to achieve. For instance
if I want a text align plugin, I will add text align buttons for left, center, and right, and when
clicked I will add `textAlign: direction` to the data attribute. This data will get saved as part
of the rich text content, and can be used then on the frontend to apply any appropriate classes
or styling. Lastly `customPlugin.js` will handle making changes to the blocks _in the actual RTE_
allowing us to have a pseudo WYSIWYG experience. Using the example of our small text plugin for 
instance, in `customPlugin.js` we're adding the style `fontSize = '0.75rem'` while in gatsby we're
adding the `text-small` class which ends up setting the font size to 12px.