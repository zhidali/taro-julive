Component({
  properties: {
    src:{
      type:String,
      value:''
    },
    title:{
      type:String,
      value:''
    },
    isShare:{
      type:Boolean,
      value:false
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
