import socketIOClient from 'socket.io-client'
import config from '../../config/env.json'
import { notify } from '../common/notification'

const { host, port } = config
const servicePath = `${host}${port ? `:${port}` : ''}`

const EVENT_TYPES = {
  txDetected: 'txDetected',
  txConfirmed: 'txConfirmed',
  txError: 'txError',
  balanceUpdated: 'balanceUpdated',
  clientError: 'clientError',
  test: 'test info',
}


const NOOP = () => { }

export default class SocketClient {

  constructor({
    path = '/io',
    onConnect = NOOP,
    onError = NOOP,
    onConnectError = NOOP,
    onTimeout = NOOP,
  } = {}) {
    this.client = socketIOClient(servicePath, { path })
    this.client.on('connect', onConnect)
    this.client.on('error', onError)
    this.client.on('connect_error', onConnectError)
    this.client.on('connect_timeout', onTimeout)
    Object.values(EVENT_TYPES).forEach(eventName =>
      this.client.on(eventName, (data) => notify(eventName, data))
    )
  }

  /**
   * 注册事件处理
   * @param {string} eventName 事件名称
   * @param {function} handler 事件处理函数
   * @param {boolean} isAppend 是否是追加处理函数，为 false 时会注销之前所有添加在该事件名称下的处理函数（默认 false）
   */
  register(eventName, handler, isAppend = false) {
    if (!isAppend) {
      this.client.off(eventName)
    }
    this.client.on(eventName, handler)
  }

  /**
   * 发送消息
   * @param {string} eventName 事件名称
   * @param {object} payload 数据
   */
  emit(eventName, payload) {
    this.client.emit(eventName, payload)
  }

  /**
   * 销毁套接字客户端
   */
  destroy() {
    if (this.client) {
      this.client.disconnect()
      this.client = null
    }
  }
}
