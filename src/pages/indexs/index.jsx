import React, { Component } from 'react'
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.less';

const app = Taro.getApp();
export default class Index extends Component {

  componentWillMount () { }

  componentDidMount () { 
    console.log(app, 'app app app');
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>
        <Text>Hello world!</Text>
      </View>
    )
  }
}
