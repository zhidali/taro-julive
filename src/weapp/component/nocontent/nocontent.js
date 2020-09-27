Component({
  properties: {
    src:{
      type:String,
      value:''
    },
    tip:{
      type:String,
      value:''
    },
    buttontitle:{
      type:String,
      value:''
    }
  },

  data: {

  },

  methods: {
    didTapButton:function(e) {
      this.triggerEvent('ButtonTap', {});
    }
  }
})
