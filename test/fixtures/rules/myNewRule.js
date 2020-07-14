const id = 'my-new-rule'

module.exports = {
  id,
  rule: function (HTMLHint, option) {
    HTMLHint.addRule({
      id,
      description: 'my-new-rule',
      init: option,
    })
  },
}
