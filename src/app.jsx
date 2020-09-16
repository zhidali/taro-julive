import { Component } from 'react'
import './app.less'

require('./pages/weapp/global')
const app = getApp();

class App extends Component {

  componentDidMount () {}

  componentDidShow (e) {
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
