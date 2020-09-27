Component({
  externalClasses: ['my-class'],
  properties: {
    className: {
      type: String,
      value: '',
    },
    classImage: {
      type: String,
      value: '',
    },
    placeholder: {
      type: String,
      value: '',
    },
    url: {
      type: String,
      value: '',
    },
    index: {
      type: Number,
      value: 0,
    },
  },

  options: {
    addGlobalClass: true,
  },
  data: {
    isLoadError: false,
  },

  methods: {
    binderror: function (e) {
      this.setData({
        url: this.data.placeholder,
        isLoadError: true,
      });
    },

    didTapImage: function (e) {
      this.triggerEvent('ImageTap', e);
    },
  },
});
