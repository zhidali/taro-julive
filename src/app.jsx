import { Component } from 'react'
import './app.less'

require('./pages/weapp/global')

if (process.env.TARO_ENV == 'weapp') {
  const app = getApp();
}

class App extends Component {

  componentDidMount () {}

  componentDidShow () {
    if (process.env.TARO_ENV == 'weapp') {
      app.onLaunch(e);
    }
  }

  componentDidHide () {}

  componentDidCatchError () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
